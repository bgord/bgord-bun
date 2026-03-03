import type { MiddlewareHandler } from "hono";
import { CacheSourceEnum } from "./cache-resolver.strategy";
import { CacheResponse } from "./cache-response.middleware";
import type { ClockPort } from "./clock.port";
import { type HttpLoggerConfig, HttpLoggerMiddleware } from "./http-logger.middleware";
import type { LoggerPort } from "./logger.port";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextAdapterHono } from "./request-context-hono.adapter";

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

export class HttpLoggerHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: HttpLoggerMiddleware;

  constructor(deps: Dependencies, config?: HttpLoggerConfig) {
    this.middleware = new HttpLoggerMiddleware(deps, config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextAdapterHono(c);

      if (this.middleware.shouldSkip(context)) return await next();

      const request = c.req.raw.clone();
      const correlationId = c.get("requestId");
      const body = await HttpLoggerHonoMiddleware.parseJSON(request);

      const { stopwatch } = this.middleware.before(context, correlationId, body);

      await next();

      const response = c.res.clone();
      const responseBody = await HttpLoggerHonoMiddleware.parseJSON(response);

      this.middleware.after(context, correlationId, {
        stopwatch,
        status: response.status,
        cacheHit: response.headers.get(CacheResponse.CACHE_HIT_HEADER) === CacheSourceEnum.hit,
        responseBody,
      });
    };
  }

  private static async parseJSON(resource: Request | Response): Promise<any> {
    try {
      return await resource.json();
    } catch {
      return undefined;
    }
  }
}
