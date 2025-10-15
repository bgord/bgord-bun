import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import _ from "lodash";
import { CacheHitEnum } from "./cache-resolver.service";
import { CacheResponse } from "./cache-response.middleware";
import { ClientFromHono } from "./client-from-hono.adapter";
import type { ClockPort } from "./clock.port";
import type { CorrelationIdType } from "./correlation-id.vo";
import type { LoggerPort } from "./logger.port";

const UNINFORMATIVE_HEADERS = [
  "accept",
  "accept-encoding",
  "cache-control",
  "connection",
  "content-length",
  "content-type",
  "cookie",
  "dnt",
  "host",
  "origin",
  "pragma",
  "sec-fetch-dest",
  "sec-fetch-mode",
  "sec-fetch-site",
  "sec-fetch-user",
  "sec-gpc",
  "upgrade-insecure-requests",
  "user-agent",
  "if-none-match",
];

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

export type HttpLoggerOptions = { skip?: readonly string[] };

export class HttpLogger {
  static build = (deps: Dependencies, options?: HttpLoggerOptions) =>
    createMiddleware(async (context, next) => {
      const request = context.req.raw.clone();

      const pathname = new URL(request.url).pathname;

      if (options?.skip?.some((prefix) => pathname.startsWith(prefix))) {
        await next();
        return;
      }

      const correlationId = context.get("requestId");
      const client = ClientFromHono.extract(context).toJSON();

      const httpRequestBeforeMetadata = {
        params: context.req.param(),
        // @ts-expect-error
        headers: _.omit(Object.fromEntries(request.headers), UNINFORMATIVE_HEADERS),
        body: await HttpLogger.parseJSON(request),
        query: context.req.queries(),
      };

      deps.Logger.http({
        component: "http",
        operation: "http_request_before",
        correlationId,
        message: "request",
        method: request.method,
        url: request.url,
        client,
        metadata: _.pickBy(httpRequestBeforeMetadata, (value) => !_.isEmpty(value)),
      });

      const stopwatch = new tools.Stopwatch(deps.Clock.nowMs());
      await next();
      const duration = stopwatch.stop();

      const response = context.res.clone();

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
        cacheHit: response.headers.get(CacheResponse.CACHE_HIT_HEADER) === CacheHitEnum.hit,
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
