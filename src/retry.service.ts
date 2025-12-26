import type { RetryBackoffStrategyPort } from "./retry-backoff-strategy.port";

type RetryConfigType = { max: number; backoff: RetryBackoffStrategyPort };

export class Retry {
  static async run<T>(action: () => Promise<T>, config: RetryConfigType): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= config.max; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error;

        if (attempt === config.max) break;

        await Bun.sleep(config.backoff.next(attempt).ms);
      }
    }

    throw lastError;
  }
}
