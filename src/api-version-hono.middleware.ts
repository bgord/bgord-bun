import type { MiddlewareHandler } from "hono";
import { ApiVersionMiddleware, type ApiVersionMiddlewareDependencies } from "./api-version.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";

export class ApiVersionHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: ApiVersionMiddleware;

  constructor(deps: ApiVersionMiddlewareDependencies) {
    this.middleware = new ApiVersionMiddleware(deps);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      await next();

      try {
        const version = await this.middleware.evaluate();

        c.res.headers.set(ApiVersionMiddleware.HEADER_NAME, version.toString());
      } catch {}
    };
  }
}
