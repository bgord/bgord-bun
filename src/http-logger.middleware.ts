import { createMiddleware } from "hono/factory";
import { CacheSourceEnum } from "./cache-resolver.strategy";
import { CacheResponse } from "./cache-response.middleware";
import type { ClockPort } from "./clock.port";
import type { LoggerPort } from "./logger.port";
import { RequestContextAdapterHono } from "./request-context-hono.adapter";
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

export type HttpLoggerOptions = { skip?: readonly string[] };

export class HttpLogger {
  static build = (deps: Dependencies, options?: HttpLoggerOptions) =>
    createMiddleware(async (c, next) => {
      const context = new RequestContextAdapterHono(c);
      const client = { ip: context.identity.ip(), ua: context.identity.ua() };

      const request = c.req.raw.clone();

      // Stryker disable all
      if (options?.skip?.some((prefix) => new URL(request.url).pathname.startsWith(prefix))) {
        return await next();
      }
      // Stryker restore all

      const correlationId = c.get("requestId");

      const httpRequestBeforeMetadata = {
        params: c.req.param(),
        headers: Object.fromEntries(
          Object.entries(request.headers.toJSON()).filter(
            ([header]) => !UNINFORMATIVE_HEADERS.includes(header),
          ),
        ),
        body: (await HttpLogger.parseJSON(request)) ?? {},
        query: context.request.query(),
      };

      deps.Logger.http({
        component: "http",
        operation: "http_request_before",
        correlationId,
        message: "request",
        method: request.method,
        url: request.url,
        client,
        metadata: httpRequestBeforeMetadata,
      });

      const stopwatch = new Stopwatch(deps);
      await next();
      const duration = stopwatch.stop();

      const response = c.res.clone();

      deps.Logger.http({
        component: "http",
        operation: "http_request_after",
        correlationId,
        message: "response",
        method: request.method,
        url: request.url,
        status: response.status,
        durationMs: duration.ms,
        client,
        cacheHit: response.headers.get(CacheResponse.CACHE_HIT_HEADER) === CacheSourceEnum.hit,
        metadata: { response: await HttpLogger.parseJSON(response) },
      });
    });

  private static async parseJSON(resource: Request | Response) {
    let result: any;
    try {
      result = await resource.json();
    } catch {}

    return result;
  }
}
