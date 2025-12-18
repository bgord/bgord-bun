import * as tools from "@bgord/tools";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { CacheResolverPort } from "./cache-resolver.port";
import type { CacheSubjectResolver } from "./cache-subject-resolver.vo";
import type { ClockPort } from "./clock.port";
import type { ShieldPort } from "./shield.port";

type ShieldRateLimitOptionsType = { enabled: boolean; resolver: CacheSubjectResolver };

type Dependencies = { Clock: ClockPort; CacheResolver: CacheResolverPort };

export const TooManyRequestsError = new HTTPException(429, { message: "app.too_many_requests" });

export class ShieldRateLimitAdapter implements ShieldPort {
  constructor(
    private readonly options: ShieldRateLimitOptionsType,
    private readonly deps: Dependencies,
  ) {}

  verify = createMiddleware(async (c, next) => {
    if (!this.options.enabled) return next();

    const subject = this.options.resolver.resolve(c);

    const limiter = await this.deps.CacheResolver.resolve(
      subject.hex,
      async () => new tools.RateLimiter(this.deps.CacheResolver.ttl),
    );

    const result = limiter.verify(this.deps.Clock.now());

    if (!result.allowed) throw TooManyRequestsError;

    return next();
  });
}
