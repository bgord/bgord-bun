import type * as tools from "@bgord/tools";

export type SemaphoreConfig = { limit: tools.IntegerPositiveType };

export class Semaphore {
  private readonly slots: Array<Promise<void>>;

  constructor(config: SemaphoreConfig) {
    this.slots = Array.from({ length: config.limit }, () => Promise.resolve());
  }

  async run<T>(action: () => Promise<T>): Promise<T> {
    const slot = this.slots.shift();
    const { promise, resolve } = Promise.withResolvers<void>();

    this.slots.push(promise);

    await slot;

    try {
      return await action();
    } finally {
      resolve();
    }
  }
}
