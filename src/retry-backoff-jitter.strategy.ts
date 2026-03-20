import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { RandomnessStrategy } from "./randomness.strategy";
import type { RetryBackoffStrategy } from "./retry-backoff.strategy";

export class RetryBackoffJitterStrategy implements RetryBackoffStrategy {
  constructor(
    private readonly delay: tools.Duration,
    private readonly randomness: RandomnessStrategy,
  ) {}

  next(attempt: tools.IntegerPositiveType): tools.Duration {
    return this.delay.times(v.parse(tools.MultiplicationFactor, attempt * this.randomness.next()));
  }
}
