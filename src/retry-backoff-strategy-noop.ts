import * as tools from "@bgord/tools";
import type { RetryBackoffStrategyPort } from "./retry-backoff-strategy.port";

export class RetryBackoffStrategyNoop implements RetryBackoffStrategyPort {
  next() {
    return tools.Duration.Ms(0);
  }
}
