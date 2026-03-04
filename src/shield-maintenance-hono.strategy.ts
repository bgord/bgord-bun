import type { MiddlewareHandler } from "hono";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { type ShieldMaintenanceConfigType, ShieldMaintenanceStrategy } from "./shield-maintenance.strategy";

export class ShieldMaintenanceHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldMaintenanceStrategy;

  constructor(config?: ShieldMaintenanceConfigType) {
    this.strategy = new ShieldMaintenanceStrategy(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const maintenance = this.strategy.evaluate();

      if (!maintenance.enabled) return next();

      return c.json({ reason: "maintenance" }, 503, {
        "Retry-After": maintenance.RetryAfter.seconds.toString(),
      });
    };
  }
}
