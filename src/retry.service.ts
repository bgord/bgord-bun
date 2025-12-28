import type { RetryBackoffStrategy } from "./retry-backoff.strategy";
import type { SleeperPort } from "./sleeper.port";

type Dependencies = { Sleeper: SleeperPort };

export type RetryConfigType = {
  max: number;
  backoff: RetryBackoffStrategy;
  when?: (error: unknown) => boolean;
};

export const RetryError = { InvalidMax: "retry.invalid.max" };

export class Retry {
  constructor(private readonly deps: Dependencies) {}

  async run<T>(action: () => Promise<T>, config: RetryConfigType): Promise<T> {
    if (config.max < 1) throw new Error(RetryError.InvalidMax);

    let lastError: unknown;

    for (let attempt = 1; attempt <= config.max; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error;

        if (attempt === config.max || (config.when && !config.when(error))) break;

        await this.deps.Sleeper.wait(config.backoff.next(attempt));
      }
    }

    throw lastError;
  }
}
