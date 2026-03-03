import type { MiddlewareHandler } from "hono";
import { type MaintenanceModeConfigType, MaintenanceModeMiddleware } from "./maintenance-mode.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";

export class MaintenanceModeHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: MaintenanceModeMiddleware;

  constructor(config?: MaintenanceModeConfigType) {
    this.middleware = new MaintenanceModeMiddleware(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const maintenance = this.middleware.evaluate();

      if (!maintenance.enabled) return next();

      return c.json({ reason: "maintenance" }, 503, {
        "Retry-After": maintenance.RetryAfter.seconds.toString(),
      });
    };
  }
}
