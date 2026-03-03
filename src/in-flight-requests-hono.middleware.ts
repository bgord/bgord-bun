import type { MiddlewareHandler } from "hono";
import { InFlightRequestsMiddleware } from "./in-flight-requests.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";

export class InFlightRequestsHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware = new InFlightRequestsMiddleware();

  handle(): MiddlewareHandler {
    return async (_c, next) => {
      await this.middleware.evaluate();

      try {
        await next();
      } finally {
        this.middleware.cleanup();
      }
    };
  }
}
