import * as bg from "@bgord/node";
import { createMiddleware } from "hono/factory";
import { getConnInfo } from "hono/bun";
import _ from "lodash";

export class HttpLogger {
  private static simplify(response: unknown) {
    const result = JSON.stringify(response, (_key, value) =>
      Array.isArray(value) ? { type: "Array", length: value.length } : value
    );

    return JSON.parse(result);
  }

  private static uninformativeHeaders = [
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

  static build = (logger: bg.Logger) =>
    createMiddleware(async (c, next) => {
      const correlationId = c.get("requestId") as bg.Schema.CorrelationIdType;
      const info = getConnInfo(c);
      const url = c.req.url;
      const method = c.req.method;

      const client = {
        ip:
          c.req.header("x-real-ip") ||
          c.req.header("x-forwarded-for") ||
          info.remote.address,
        userAgent: c.req.header("user-agent"),
      };

      let body: any;

      try {
        body = await c.req.json();
      } catch (error) {}

      const httpRequestBeforeMetadata = {
        params: c.req.param(),
        headers: _.omit(
          c.req.raw.headers.toJSON(),
          HttpLogger.uninformativeHeaders
        ),
        body,
        query: c.req.queries(),
      };

      logger.http({
        operation: "http_request_before",
        correlationId,
        message: "request",
        method,
        url,
        client,
        metadata: _.pickBy(
          httpRequestBeforeMetadata,
          (value) => !_.isEmpty(value)
        ),
      });

      await next();

      const cacheHitHeader = c.res.headers.get(
        bg.CacheResponse.CACHE_HIT_HEADER
      );

      const cacheHit =
        cacheHitHeader === bg.CacheHitEnum.hit
          ? bg.CacheHitEnum.hit
          : undefined;

      let response: any;
      try {
        response = await c.res.clone().json();
      } catch (error) {}

      const httpRequestAfterMetadata = {
        response,
        cacheHit,
      };

      const serverTimingMs = c.res.headers.get("Server-Timing");

      const durationMsMatch =
        serverTimingMs?.match(/dur=([0-9]*\.?[0-9]+)/) ?? undefined;

      const durationMs = durationMsMatch?.[1]
        ? Number(durationMsMatch[1])
        : undefined;

      logger.http({
        operation: "http_request_after",
        correlationId,
        message: "response",
        method,
        url,
        responseCode: c.res.status,
        durationMs,
        client,
        metadata: HttpLogger.simplify(httpRequestAfterMetadata),
      });
    });
}
