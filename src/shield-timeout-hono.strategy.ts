import type * as tools from "@bgord/tools";
import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { timeout } from "hono/timeout";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { ShieldTimeoutStrategy, ShieldTimeoutStrategyError } from "./shield-timeout.strategy";

export class ShieldTimeoutHonoStrategy implements MiddlewareHonoPort {
  private readonly timeout: MiddlewareHandler;

  constructor(config: tools.Duration) {
    const strategy = new ShieldTimeoutStrategy(config);

    this.timeout = timeout(
      strategy.config.ms,
      new HTTPException(408, { message: ShieldTimeoutStrategyError.Rejected }),
    );
  }

  handle(): MiddlewareHandler {
    return this.timeout;
  }
}
