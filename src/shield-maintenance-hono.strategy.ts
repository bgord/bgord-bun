import * as tools from "@bgord/tools";
import type { MiddlewareHandler } from "hono";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { type ShieldMaintenanceConfig, ShieldMaintenanceStrategy } from "./shield-maintenance.strategy";

export class ShieldMaintenanceHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldMaintenanceStrategy;
  private readonly rounding = new tools.RoundingUpStrategy();

  constructor(config?: ShieldMaintenanceConfig) {
    this.strategy = new ShieldMaintenanceStrategy(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const maintenance = await this.strategy.evaluate();

      if (!maintenance.enabled) return next();

      return c.json({ reason: "maintenance" }, 503, {
        // Retry-After must be an integer number of seconds, fractions are discarded by clients
        "Retry-After": this.rounding.round(maintenance.RetryAfter.seconds).toString(),
      });
    };
  }
}
