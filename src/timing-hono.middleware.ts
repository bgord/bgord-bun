import { createMiddleware } from "hono/factory";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import { TimingMiddleware, type TimingMiddlewareDependencies } from "./timing.middleware";

export class TimingHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: TimingMiddleware;

  constructor(deps: TimingMiddlewareDependencies) {
    this.middleware = new TimingMiddleware(deps);
  }

  handle() {
    return createMiddleware(async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      const timing = await this.middleware.measure(context, () => next());

      if (!timing) return next();

      c.header(TimingMiddleware.HEADER_NAME, timing, { append: true });
    });
  }
}
