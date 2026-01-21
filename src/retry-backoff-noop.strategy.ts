import * as tools from "@bgord/tools";
import type { RetryBackoffStrategy } from "./retry-backoff.strategy";

export class RetryBackoffNoopStrategy implements RetryBackoffStrategy {
  next(): tools.Duration {
    return tools.Duration.Ms(0);
  }
}
