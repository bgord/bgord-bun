import * as tools from "@bgord/tools";
import type { RetryBackoffStrategy } from "./retry-backoff.strategy";
import type { SleeperPort } from "./sleeper.port";

type Dependencies = { Sleeper: SleeperPort };

export type RetryConfig = {
  max: tools.IntegerPositiveType;
  backoff: RetryBackoffStrategy;
  when?: (error: unknown) => boolean;
};

export class Retry {
  constructor(private readonly deps: Dependencies) {}

  async run<T>(action: () => Promise<T>, config: RetryConfig): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= config.max; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error;

        if (attempt === config.max || (config.when && !config.when(error))) break;
        await this.deps.Sleeper.wait(config.backoff.next(tools.Int.positive(attempt)));
      }
    }

    throw lastError;
  }
}
