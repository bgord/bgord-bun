import type { RetryBackoffStrategyPort } from "./retry-backoff-strategy.port";

export type RetryConfigType = {
  max: number;
  backoff: RetryBackoffStrategyPort;
  when?: (error: unknown) => boolean;
};

export const RetryError = { InvalidMax: "retry.invalid.max" };

export class Retry {
  static async run<T>(action: () => Promise<T>, config: RetryConfigType): Promise<T> {
    if (config.max < 1) throw new Error(RetryError.InvalidMax);

    let lastError: unknown;

    for (let attempt = 1; attempt <= config.max; attempt++) {
      try {
        return await action();
      } catch (error) {
        lastError = error;

        if (attempt === config.max || (config.when && !config.when(error))) break;

        await Bun.sleep(config.backoff.next(attempt).ms);
      }
    }

    throw lastError;
  }
}
