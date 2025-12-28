import * as tools from "@bgord/tools";
import type { RetryBackoffStrategy } from "./retry-backoff-strategy.port";

export class RetryBackoffLinearStrategy implements RetryBackoffStrategy {
  constructor(private readonly delay: tools.Duration) {}

  next(attempt: number) {
    return this.delay.times(tools.MultiplicationFactor.parse(attempt));
  }
}
