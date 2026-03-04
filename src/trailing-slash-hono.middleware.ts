import { createMiddleware } from "hono/factory";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import { TrailingSlashMiddleware } from "./trailing-slash.middleware";

export class TrailingSlashHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: TrailingSlashMiddleware;

  constructor() {
    this.middleware = new TrailingSlashMiddleware();
  }

  handle() {
    return createMiddleware(async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      const result = this.middleware.evaluate(context);

      if (!result.redirect) return next();

      const url = new URL(context.request.url());
      url.pathname = result.pathname;

      return c.redirect(url.toString(), 301);
    });
  }
}
