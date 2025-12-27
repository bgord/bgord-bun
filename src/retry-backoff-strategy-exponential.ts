import * as tools from "@bgord/tools";
import type { RetryBackoffStrategyPort } from "./retry-backoff-strategy.port";

export class RetryBackoffStrategyExponential implements RetryBackoffStrategyPort {
  constructor(private readonly delay: tools.Duration) {}

  next(attempt: number) {
    if (attempt === 0) return tools.Duration.Ms(0);
    return this.delay.times(tools.MultiplicationFactor.parse(2 ** (attempt - 1)));
  }
}
