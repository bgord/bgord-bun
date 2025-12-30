import * as tools from "@bgord/tools";
import type { RetryBackoffStrategy } from "./retry-backoff.strategy";

export class RetryBackoffLinearStrategy implements RetryBackoffStrategy {
  constructor(private readonly delay: tools.Duration) {}

  next(attempt: tools.IntegerPositiveType) {
    return this.delay.times(tools.MultiplicationFactor.parse(attempt));
  }
}
