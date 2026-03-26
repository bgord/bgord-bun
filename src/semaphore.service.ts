import type * as tools from "@bgord/tools";

export type SemaphoreConfig = { limit: tools.IntegerPositiveType };

export class Semaphore {
  private running = 0;
  private readonly queue: Array<() => void> = [];

  constructor(private readonly config: SemaphoreConfig) {}

  async run<T>(action: () => Promise<T>): Promise<T> {
    await this.acquire();

    try {
      return await action();
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<void> {
    if (this.running < this.config.limit) {
      this.running++;
      return Promise.resolve();
    }

    return new Promise((resolve) => this.queue.push(resolve));
  }

  private release(): void {
    const next = this.queue.shift();

    if (next) {
      next();
    } else {
      this.running--;
    }
  }
}
