import type { RetryBackoffStrategyPort } from "./retry-backoff-strategy.port";

type RetryConfigType = { max: number; backoff: RetryBackoffStrategyPort };

export class Retry {
  static async run<T>(action: () => Promise<T>, config: RetryConfigType): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt < config.max; attempt++) {
      const delay = config.backoff.next(attempt);

      await Bun.sleep(delay.ms);

      try {
        return await action();
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }
}
