import * as tools from "@bgord/tools";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { ClockPort } from "./clock.port";
import type { RequestContext } from "./request-context.port";
import type { SubjectRequestResolver } from "./subject-request-resolver.vo";

export type ShieldRateLimitConfig = { resolver: SubjectRequestResolver; window: tools.Duration };

type Dependencies = { Clock: ClockPort; CacheResolver: CacheResolverStrategy };

export const ShieldRateLimitStrategyError = { Rejected: "shield.rate.limit.rejected" };

export class ShieldRateLimitStrategy {
  constructor(
    private readonly config: ShieldRateLimitConfig,
    private readonly deps: Dependencies,
  ) {}

  async evaluate(context: RequestContext): Promise<boolean> {
    const subject = await this.config.resolver.resolve(context);

    const limiter = await this.deps.CacheResolver.resolve(
      subject.hex,
      async () => new tools.RateLimiter(this.config.window),
    );

    return limiter.verify(this.deps.Clock.now()).allowed;
  }
}
