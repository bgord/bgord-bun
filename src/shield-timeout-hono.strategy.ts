import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { timeout } from "hono/timeout";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import {
  type ShieldTimeoutConfig,
  ShieldTimeoutStrategy,
  ShieldTimeoutStrategyError,
} from "./shield-timeout.strategy";

export const ShieldTimeoutError = new HTTPException(408, { message: ShieldTimeoutStrategyError.Rejected });

export class ShieldTimeoutHonoStrategy implements MiddlewareHonoPort {
  private readonly timeout: MiddlewareHandler;

  constructor(config: ShieldTimeoutConfig) {
    const strategy = new ShieldTimeoutStrategy(config);

    this.timeout = timeout(strategy.config.duration.ms, ShieldTimeoutError);
  }

  handle(): MiddlewareHandler {
    return this.timeout;
  }
}
