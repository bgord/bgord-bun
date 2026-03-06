import type { RequestHandler } from "express";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { ClockPort } from "./clock.port";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";
import {
  type ShieldRateLimitConfig,
  ShieldRateLimitStrategy,
  ShieldRateLimitStrategyError,
} from "./shield-rate-limit.strategy";

type Dependencies = { Clock: ClockPort; CacheResolver: CacheResolverStrategy };

export class ShieldRateLimitExpressStrategy implements MiddlewareExpressPort {
  private readonly strategy: ShieldRateLimitStrategy;

  constructor(config: ShieldRateLimitConfig, deps: Dependencies) {
    this.strategy = new ShieldRateLimitStrategy(config, deps);
  }

  handle(): RequestHandler {
    return async (request, response, next) => {
      const context = new RequestContextExpressAdapter(request);

      if (await this.strategy.evaluate(context)) return next();
      return response.status(429).json({ message: ShieldRateLimitStrategyError.Rejected, _known: true });
    };
  }
}
