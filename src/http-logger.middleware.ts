import * as tools from "@bgord/tools";
import { getConnInfo } from "hono/bun";
import { createMiddleware } from "hono/factory";
import _ from "lodash";
import { CacheHitEnum } from "./cache-resolver.service";
import { CacheResponse } from "./cache-response.middleware";
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

export class HttpLogger {
  private static simplify(response: unknown) {
    const result = JSON.stringify(response, (_key, value) =>
      Array.isArray(value) ? { type: "Array", length: value.length } : value,
    );

    return JSON.parse(result);
  }

  static build = (logger: LoggerPort) =>
    createMiddleware(async (c, next) => {
      const request = c.req.raw.clone();
      const response = c.res.clone();
      const info = getConnInfo(c);

      const correlationId = c.get("requestId") as CorrelationIdType;
      const url = c.req.url;
      const method = c.req.method;

      const client = {
        ip: c.req.header("x-real-ip") || c.req.header("x-forwarded-for") || info.remote.address,
        userAgent: c.req.header("user-agent"),
      };

      let body: any;

      try {
        body = await request.json();
      } catch (_error) {}

      const httpRequestBeforeMetadata = {
        params: c.req.param(),
        // @ts-expect-error
        headers: _.omit(Object.fromEntries(request.headers), UNINFORMATIVE_HEADERS),
        body,
        query: c.req.queries(),
      };

      logger.http({
        component: "http",
        operation: "http_request_before",
        correlationId,
        message: "request",
        method,
        url,
        client,
        metadata: _.pickBy(httpRequestBeforeMetadata, (value) => !_.isEmpty(value)),
      });

      const stopwatch = new tools.Stopwatch();
      await next();
      const duration = stopwatch.stop();

      const cacheHitHeader = response.headers.get(CacheResponse.CACHE_HIT_HEADER);

      const cacheHit = cacheHitHeader === CacheHitEnum.hit ? CacheHitEnum.hit : undefined;

      let result: any;
      try {
        result = await c.res.clone().json();
      } catch (_error) {}

      const httpRequestAfterMetadata = {
        response: result,
        cacheHit,
      };

      logger.http({
        component: "http",
        operation: "http_request_after",
        correlationId,
        message: "response",
        method,
        url,
        status: c.res.status,
        durationMs: duration.durationMs,
        client,
        metadata: HttpLogger.simplify(httpRequestAfterMetadata),
      });
    });
}
