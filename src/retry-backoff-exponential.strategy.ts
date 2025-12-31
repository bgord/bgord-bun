import * as tools from "@bgord/tools";
import type { RetryBackoffStrategy } from "./retry-backoff.strategy";

export class RetryBackoffExponentialStrategy implements RetryBackoffStrategy {
  constructor(private readonly delay: tools.Duration) {}

  next(attempt: tools.IntegerPositiveType) {
    return this.delay.times(tools.MultiplicationFactor.parse(2 ** (attempt - 1)));
  }
}
