import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import _ from "lodash";
import { CacheHitEnum } from "./cache-resolver.service";
import { CacheResponse } from "./cache-response.middleware";
import { ClientFromHono } from "./client-from-hono.adapter";
import type { ClockPort } from "./clock.port";
import type { CorrelationIdType } from "./correlation-id.vo";
import type { LoggerPort } from "./logger.port";
import { LogSimplifier } from "./logger-simplify.service";

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

export class HttpLogger {
  static build = (deps: Dependencies) =>
    createMiddleware(async (c, next) => {
      const request = c.req.raw.clone();

      const correlationId = c.get("requestId") as CorrelationIdType;
      const url = c.req.url;
      const method = c.req.method;

      const client = ClientFromHono.extract(c).toJSON();

      const httpRequestBeforeMetadata = {
        params: c.req.param(),
        // @ts-expect-error
        headers: _.omit(Object.fromEntries(request.headers), UNINFORMATIVE_HEADERS),
        body: await HttpLogger.parseJSON(request),
        query: c.req.queries(),
      };

      deps.Logger.http({
        component: "http",
        operation: "http_request_before",
        correlationId,
        message: "request",
        method,
        url,
        client,
        metadata: _.pickBy(httpRequestBeforeMetadata, (value) => !_.isEmpty(value)),
      });

      const stopwatch = new tools.Stopwatch(deps.Clock.nowMs());
      await next();
      const { durationMs } = stopwatch.stop();

      const response = c.res.clone();

      deps.Logger.http({
        component: "http",
        operation: "http_request_after",
        correlationId,
        message: "response",
        method,
        url,
        status: c.res.status,
        durationMs,
        client,
        cacheHit: response.headers.get(CacheResponse.CACHE_HIT_HEADER) === CacheHitEnum.hit,
        metadata: LogSimplifier.simplify({ response: await HttpLogger.parseJSON(response) }),
      });
    });

  private static async parseJSON(resource: Request | Response) {
    let result: any;
    try {
      result = await resource.json();
    } catch (_error) {}

    return result;
  }
}
