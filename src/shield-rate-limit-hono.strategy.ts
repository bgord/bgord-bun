import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { ClockPort } from "./clock.port";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";
import {
  type ShieldRateLimitConfig,
  ShieldRateLimitStrategy,
  ShieldRateLimitStrategyError,
} from "./shield-rate-limit.strategy";

type Dependencies = { Clock: ClockPort; CacheResolver: CacheResolverStrategy };

export class ShieldRateLimitHonoStrategy implements MiddlewareHonoPort {
  private readonly strategy: ShieldRateLimitStrategy;

  constructor(config: ShieldRateLimitConfig, deps: Dependencies) {
    this.strategy = new ShieldRateLimitStrategy(config, deps);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      const result = await this.strategy.evaluate(context);

      if (result.allowed) return next();

      c.header("Retry-After", result.retryAfter.seconds.toString());
      throw new HTTPException(429, { message: ShieldRateLimitStrategyError.Rejected });
    };
  }
}
