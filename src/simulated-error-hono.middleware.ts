import type { MiddlewareHandler } from "hono";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { SimulatedErrorMiddleware } from "./simulated-error.middleware";

export class SimulatedErrorHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: SimulatedErrorMiddleware;

  constructor() {
    this.middleware = new SimulatedErrorMiddleware();
  }

  handle(): MiddlewareHandler {
    return async (_c, _next) => {
      this.middleware.evaluate();
    };
  }
}
