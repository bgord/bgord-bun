import type * as tools from "@bgord/tools";

export type SemaphoreConfig = { limit: tools.IntegerPositiveType };

export class Semaphore {
  private readonly limit: tools.IntegerPositiveType;

  private active = 0;

  private readonly waiting: Array<() => void> = [];

  constructor(config: SemaphoreConfig) {
    this.limit = config.limit;
  }

  async run<T>(action: () => Promise<T>): Promise<T> {
    if (this.active >= this.limit) await new Promise<void>((resolve) => this.waiting.push(resolve));
    else this.active++;

    try {
      return await action();
    } finally {
      const next = this.waiting.shift();

      if (next) next();
      else this.active--;
    }
  }
}
