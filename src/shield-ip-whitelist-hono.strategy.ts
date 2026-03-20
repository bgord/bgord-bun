import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import {
  type ShieldIpWhitelistConfig,
  ShieldIpWhitelistStrategy,
  ShieldIpWhitelistStrategyError,
} from "./shield-ip-whitelist.strategy";

export const ShieldIpWhitelistError = new HTTPException(403, {
  message: ShieldIpWhitelistStrategyError.Rejected,
});

export class ShieldIpWhitelistHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldIpWhitelistStrategy;

  constructor(config: ShieldIpWhitelistConfig) {
    this.strategy = new ShieldIpWhitelistStrategy(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      if (this.strategy.evaluate(context)) return next();
      throw ShieldIpWhitelistError;
    };
  }
}
