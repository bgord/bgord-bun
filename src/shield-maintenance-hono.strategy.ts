import type { MiddlewareHandler } from "hono";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import { type ShieldMaintenanceConfig, ShieldMaintenanceStrategy } from "./shield-maintenance.strategy";

export class ShieldMaintenanceHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldMaintenanceStrategy;

  constructor(config?: ShieldMaintenanceConfig) {
    this.strategy = new ShieldMaintenanceStrategy(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      if (this.strategy.shouldSkip(context)) return next();

      const maintenance = await this.strategy.evaluate();

      if (!maintenance.enabled) return next();

      return Response.json(maintenance.body, { status: maintenance.code, headers: maintenance.headers });
    };
  }
}
