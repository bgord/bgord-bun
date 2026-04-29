import type { MiddlewareHandler } from "hono";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { type ShieldFeatureFlagConfig, ShieldFeatureFlagStrategy } from "./shield-feature-flag.strategy";

export class ShieldFeatureFlagHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldFeatureFlagStrategy;

  constructor(config: ShieldFeatureFlagConfig) {
    this.strategy = new ShieldFeatureFlagStrategy(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const enabled = this.strategy.evaluate();

      if (enabled) return next();
      return c.notFound();
    };
  }
}
