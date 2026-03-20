import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import {
  type ShieldIpBlacklistConfig,
  ShieldIpBlacklistStrategy,
  ShieldIpBlacklistStrategyError,
} from "./shield-ip-blacklist.strategy";

export const ShieldIpBlacklistError = new HTTPException(403, {
  message: ShieldIpBlacklistStrategyError.Rejected,
});

export class ShieldIpBlacklistHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldIpBlacklistStrategy;

  constructor(config: ShieldIpBlacklistConfig) {
    this.strategy = new ShieldIpBlacklistStrategy(config);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      if (this.strategy.evaluate(context)) return next();
      throw ShieldIpBlacklistError;
    };
  }
}
