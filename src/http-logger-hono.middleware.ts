import type { MiddlewareHandler } from "hono";
import {
  type HttpLoggerConfig,
  HttpLoggerMiddleware,
  type HttpLoggerMiddlewareDependencies,
} from "./http-logger.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

export class HttpLoggerHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: HttpLoggerMiddleware;

  constructor(deps: HttpLoggerMiddlewareDependencies, config?: HttpLoggerConfig) {
    this.middleware = new HttpLoggerMiddleware(deps, config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      if (this.middleware.shouldSkip(context)) return await next();

      const correlationId = c.get("correlationId");
      const body = await HttpLoggerHonoMiddleware.parseJSON(c.req.raw);

      const { stopwatch } = this.middleware.before(context, correlationId, body);

      await next();

      const responseBody = await HttpLoggerHonoMiddleware.parseJSON(c.res);

      this.middleware.after(context, correlationId, {
        stopwatch,
        status: c.res.status,
        responseBody,
      });
    };
  }

  private static async parseJSON(resource: Request | Response): Promise<any> {
    if (!HttpLoggerHonoMiddleware.isJSON(resource.headers.get("content-type"))) return undefined;

    try {
      return await resource.clone().json();
    } catch {}
  }

  private static isJSON(contentType: string | null): boolean {
    const type = contentType?.split(";")[0]?.trim().toLowerCase();

    return type === "application/json" || Boolean(type?.endsWith("+json"));
  }
}
