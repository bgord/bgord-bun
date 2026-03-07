import type { RequestHandler } from "express";
import { CacheSourceEnum } from "./cache-resolver.strategy";
import { CacheResponseMiddleware } from "./cache-response.middleware";
import type { ClockPort } from "./clock.port";
import { type HttpLoggerConfig, HttpLoggerMiddleware } from "./http-logger.middleware";
import type { LoggerPort } from "./logger.port";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

export class HttpLoggerExpressMiddleware implements MiddlewareExpressPort {
  private readonly middleware: HttpLoggerMiddleware;

  constructor(deps: Dependencies, config?: HttpLoggerConfig) {
    this.middleware = new HttpLoggerMiddleware(deps, config);
  }

  handle(): RequestHandler {
    return (request, response, next) => {
      const context = new RequestContextExpressAdapter(request);

      if (this.middleware.shouldSkip(context)) return next();

      const correlationId = request.correlationId;
      const body = request.body;

      const { stopwatch } = this.middleware.before(context, correlationId, body);

      response.on("finish", () => {
        const cacheHitHeader = response.getHeader(CacheResponseMiddleware.CACHE_HIT_HEADER);

        this.middleware.after(context, correlationId, {
          stopwatch,
          status: response.statusCode,
          cacheHit: cacheHitHeader === CacheSourceEnum.hit,
          responseBody: response.locals.body,
        });
      });

      next();
    };
  }
}
