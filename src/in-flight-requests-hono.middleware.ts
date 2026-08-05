import type { MiddlewareHandler } from "hono";
import { InFlightRequestsMiddleware } from "./in-flight-requests.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";

// Counts handler execution, not connection lifetime - a streamed body drains after next() resolves
export class InFlightRequestsHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware = new InFlightRequestsMiddleware();

  handle(): MiddlewareHandler {
    return async (_c, next) => {
      this.middleware.evaluate();

      try {
        await next();
      } finally {
        this.middleware.cleanup();
      }
    };
  }
}
