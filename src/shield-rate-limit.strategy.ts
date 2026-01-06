import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { CacheSubjectResolver } from "./cache-subject-resolver.vo";
import type { ClockPort } from "./clock.port";
import type { ShieldStrategy } from "./shield.strategy";

type ShieldRateLimitOptionsType = {
  enabled: boolean;
  resolver: CacheSubjectResolver;
  window: tools.Duration;
};

type Dependencies = { Clock: ClockPort; CacheResolver: CacheResolverStrategy };

export const ShieldRateLimitError = new HTTPException(429, { message: "shield.rate.limit" });

export class ShieldRateLimitStrategy implements ShieldStrategy {
  constructor(
    private readonly options: ShieldRateLimitOptionsType,
    private readonly deps: Dependencies,
  ) {}

  verify = createMiddleware(async (c, next) => {
    if (!this.options.enabled) return next();

    const subject = await this.options.resolver.resolve(c);

    const limiter = await this.deps.CacheResolver.resolve(
      subject.hex,
      async () => new tools.RateLimiter(this.options.window),
    );

    const result = limiter.verify(this.deps.Clock.now());

    if (!result.allowed) throw ShieldRateLimitError;

    return next();
  });
}
