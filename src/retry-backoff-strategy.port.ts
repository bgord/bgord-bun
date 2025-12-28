import type * as tools from "@bgord/tools";

export interface RetryBackoffStrategy {
  next(attempt: number): tools.Duration;
}
