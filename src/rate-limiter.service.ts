import * as tools from "@bgord/tools";

type RateLimiterResultSuccessType = { allowed: true };
type RateLimiterResultErrorType = { allowed: false; remaining: tools.Duration };
type RateLimiterResultType = RateLimiterResultSuccessType | RateLimiterResultErrorType;

export type RateLimiterStateType = { lastInvocation: tools.TimestampValueType | null };

export class RateLimiter {
  private lastInvocation: tools.Timestamp | null = null;

  constructor(private readonly duration: tools.Duration) {}

  static fromState(duration: tools.Duration, state: RateLimiterStateType): RateLimiter {
    const limiter = new RateLimiter(duration);

    if (state.lastInvocation !== null) {
      limiter.lastInvocation = tools.Timestamp.fromNumber(state.lastInvocation);
    }

    return limiter;
  }

  verify(now: tools.Timestamp): RateLimiterResultType {
    if (this.lastInvocation === null) {
      this.lastInvocation = now;

      return { allowed: true };
    }

    const nextAllowedTimestamp = this.lastInvocation.add(this.duration);

    if (nextAllowedTimestamp.isBeforeOrEqual(now)) {
      this.lastInvocation = now;

      return { allowed: true };
    }

    return { allowed: false, remaining: nextAllowedTimestamp.difference(now) };
  }

  toJSON(): RateLimiterStateType {
    return { lastInvocation: this.lastInvocation === null ? null : this.lastInvocation.toJSON() };
  }
}
