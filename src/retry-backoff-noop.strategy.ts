import * as tools from "@bgord/tools";
import type { RetryBackoffStrategy } from "./retry-backoff-strategy.port";

export class RetryBackoffNoopStrategy implements RetryBackoffStrategy {
  next() {
    return tools.Duration.Ms(0);
  }
}
