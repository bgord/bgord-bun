import type * as tools from "@bgord/tools";

export interface RetryBackoffStrategy {
  next(attempt: tools.IntegerPositiveType): tools.Duration;
}
