import * as tools from "@bgord/tools";
import * as v from "valibot";
import type { RetryBackoffStrategy } from "./retry-backoff.strategy";

export class RetryBackoffExponentialStrategy implements RetryBackoffStrategy {
  constructor(private readonly delay: tools.Duration) {}

  next(attempt: tools.IntegerPositiveType): tools.Duration {
    return this.delay.times(v.parse(tools.MultiplicationFactor, 2 ** (attempt - 1)));
  }
}
