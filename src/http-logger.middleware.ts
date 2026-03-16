import type { ClockPort } from "./clock.port";
import { type LoggerPort, LogLevelEnum } from "./logger.port";
import type { HasRequestHeader, HasRequestPath, RequestContext } from "./request-context.port";
import { Stopwatch } from "./stopwatch.service";

export const UNINFORMATIVE_HEADERS = [
  "accept",
  "accept-encoding",
  "cache-control",
  "connection",
  "content-length",
  "content-type",
  "cookie",
  "dnt",
  "host",
  "pragma",
  "sec-fetch-dest",
  "sec-fetch-mode",
  "sec-fetch-site",
  "sec-fetch-user",
  "sec-gpc",
  "upgrade-insecure-requests",
  "user-agent",
  "if-none-match",
  "priority",
];

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

export type HttpLoggerConfig = { skip?: ReadonlyArray<string> };

export type HttpLoggerBeforeResult = { stopwatch: Stopwatch };
export type HttpLoggerAfterInput = {
  stopwatch: Stopwatch;
  status: number;
  cacheHit: boolean;
  responseBody: any;
};

export class HttpLoggerMiddleware {
  constructor(
    private readonly deps: Dependencies,
    private readonly config?: HttpLoggerConfig,
  ) {}

  shouldSkip(context: HasRequestPath & HasRequestHeader): boolean {
    if (this.config?.skip?.some((prefix) => context.request.path.startsWith(prefix))) return true;
    if (context.request.header("accept") === "text/event-stream") return true;
    return false;
  }

  before(context: RequestContext, correlationId: string, body: any = {}): HttpLoggerBeforeResult {
    const client = { ip: context.identity.ip(), ua: context.identity.ua() };

    const metadata = {
      params: context.request.params(),
      headers: Object.fromEntries(
        Object.entries(context.request.headersObject()).filter(
          ([header]) => !UNINFORMATIVE_HEADERS.includes(header),
        ),
      ),
      body,
      query: context.request.query(),
    };

    this.deps.Logger.http({
      component: "http",
      operation: "http_request_before",
      correlationId,
      message: "request",
      method: context.request.method,
      url: context.request.url(),
      client,
      metadata,
    });

    return { stopwatch: new Stopwatch(this.deps) };
  }

  after(context: RequestContext, correlationId: string, input: HttpLoggerAfterInput): void {
    const client = { ip: context.identity.ip(), ua: context.identity.ua() };
    const duration = input.stopwatch.stop();
    const level = input.status >= 400 ? LogLevelEnum.error : LogLevelEnum.http;

    this.deps.Logger[level]({
      component: "http",
      operation: "http_request_after",
      correlationId,
      message: "response",
      method: context.request.method,
      url: context.request.url(),
      status: input.status,
      ms: duration.ms,
      client,
      cacheHit: input.cacheHit,
      metadata: { response: input.responseBody },
    });
  }
}
