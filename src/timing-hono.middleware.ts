import { createMiddleware } from "hono/factory";
import type { ClockPort } from "./clock.port";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import { TimingMiddleware } from "./timing.middleware";

type Dependencies = { Clock: ClockPort };

export class TimingHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: TimingMiddleware;

  constructor(deps: Dependencies) {
    this.middleware = new TimingMiddleware(deps);
  }

  handle() {
    return createMiddleware(async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      const timing = await this.middleware.measure(context, () => next());

      if (!timing) return next();

      c.header(TimingMiddleware.HEADER_NAME, timing);
    });
  }
}
