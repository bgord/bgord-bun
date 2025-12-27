import * as tools from "@bgord/tools";
import type { RetryBackoffStrategyPort } from "./retry-backoff-strategy.port";

export class RetryBackoffStrategyLinear implements RetryBackoffStrategyPort {
  constructor(private readonly delay: tools.Duration) {}

  next(attempt: number) {
    return this.delay.times(tools.MultiplicationFactor.parse(attempt));
  }
}
