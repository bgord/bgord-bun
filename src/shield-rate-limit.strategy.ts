import * as tools from "@bgord/tools";
import type { CacheRepositoryPort } from "./cache-repository.port";
import type { ClockPort } from "./clock.port";
import { RateLimiter, type RateLimiterStateType } from "./rate-limiter.service";
import type { RequestContext } from "./request-context.port";
import type { SubjectRequestResolver } from "./subject-request-resolver.vo";

export type ShieldRateLimitConfig = { resolver: SubjectRequestResolver; interval: tools.Duration };
type ShieldRateLimitResult = { allowed: true } | { allowed: false; retryAfter: tools.Duration };

type Dependencies = { Clock: ClockPort; CacheRepository: CacheRepositoryPort };

export const ShieldRateLimitStrategyError = { Rejected: "shield.rate.limit.rejected" };

export class ShieldRateLimitStrategy {
  private readonly rounding = new tools.RoundingUpStrategy();

  constructor(
    private readonly config: ShieldRateLimitConfig,
    private readonly deps: Dependencies,
  ) {}

  async evaluate(context: RequestContext): Promise<ShieldRateLimitResult> {
    const subject = await this.config.resolver.resolve(context);

    const state = await this.deps.CacheRepository.get<RateLimiterStateType>(subject.hex);

    const limiter =
      state === null
        ? new RateLimiter(this.config.interval)
        : RateLimiter.fromState(this.config.interval, state);

    const decision = limiter.verify(this.deps.Clock.now());

    if (decision.allowed) {
      await this.deps.CacheRepository.set(subject.hex, limiter.toJSON());

      return { allowed: true };
    }

    return {
      allowed: false,
      retryAfter: tools.Duration.Seconds(this.rounding.round(decision.remaining.seconds)),
    };
  }
}
