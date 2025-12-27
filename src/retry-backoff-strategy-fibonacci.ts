import * as tools from "@bgord/tools";
import type { RetryBackoffStrategyPort } from "./retry-backoff-strategy.port";

export class RetryBackoffStrategyFibonacci implements RetryBackoffStrategyPort {
  constructor(private readonly delay: tools.Duration) {}

  next(attempt: number) {
    return this.delay.times(tools.MultiplicationFactor.parse(this.fibonacci(attempt)));
  }

  private fibonacci(n: number): number {
    if (n === 0) return 0;
    if (n === 1) return 1;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
