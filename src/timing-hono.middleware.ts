import { createMiddleware } from "hono/factory";
import type { ClockPort } from "./clock.port";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { TimingMiddleware } from "./timing.middleware";

type Dependencies = { Clock: ClockPort };

export class TimingHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: TimingMiddleware;

  constructor(deps: Dependencies) {
    this.middleware = new TimingMiddleware(deps);
  }

  handle() {
    return createMiddleware(async (c, next) => {
      if (c.req.header("accept") === "text/event-stream") return next();

      const result = await this.middleware.measure(() => next());

      c.header(TimingMiddleware.HEADER_NAME, result);
    });
  }
}
