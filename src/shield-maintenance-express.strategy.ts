import type { RequestHandler } from "express";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { type ShieldMaintenanceConfig, ShieldMaintenanceStrategy } from "./shield-maintenance.strategy";

export class ShieldMaintenanceExpressStrategy implements MiddlewareExpressPort {
  private readonly strategy: ShieldMaintenanceStrategy;

  constructor(config?: ShieldMaintenanceConfig) {
    this.strategy = new ShieldMaintenanceStrategy(config);
  }

  handle(): RequestHandler {
    return (_request, response, next) => {
      const maintenance = this.strategy.evaluate();

      if (!maintenance.enabled) return next();

      return response
        .status(503)
        .set("Retry-After", maintenance.RetryAfter.seconds.toString())
        .json({ reason: "maintenance" });
    };
  }
}
