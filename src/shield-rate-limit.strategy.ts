import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { CacheSubjectResolver } from "./cache-subject-resolver.vo";
import type { ClockPort } from "./clock.port";
import type { ShieldStrategy } from "./shield.strategy";

type ShieldRateLimitOptionsType = { enabled: boolean; resolver: CacheSubjectResolver };

type Dependencies = { Clock: ClockPort; CacheResolver: CacheResolverStrategy };

export const TooManyRequestsError = new HTTPException(429, { message: "app.too_many_requests" });

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
      async () => new tools.RateLimiter(this.deps.CacheResolver.ttl),
    );

    const result = limiter.verify(this.deps.Clock.now());

    if (!result.allowed) throw TooManyRequestsError;

    return next();
  });
}
