import type * as tools from "@bgord/tools";

export interface RetryBackoffStrategyPort {
  next(attempt: number): tools.Duration;
}
