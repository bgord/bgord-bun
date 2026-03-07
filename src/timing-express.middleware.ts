import type { RequestHandler } from "express";
import onHeaders from "on-headers";
import type { ClockPort } from "./clock.port";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { Stopwatch } from "./stopwatch.service";
import { TimingMiddleware } from "./timing.middleware";

type Dependencies = { Clock: ClockPort };

export class TimingExpressMiddleware implements MiddlewareExpressPort {
  private readonly deps: Dependencies;

  constructor(deps: Dependencies) {
    this.deps = deps;
  }

  handle(): RequestHandler {
    return (_request, response, next) => {
      const stopwatch = new Stopwatch(this.deps);

      onHeaders(response, () => {
        response.setHeader(TimingMiddleware.HEADER_NAME, `total;dur=${stopwatch.stop().ms}`);
      });

      next();
    };
  }
}
