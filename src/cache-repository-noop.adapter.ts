import type { CacheRepositoryPort } from "./cache-repository.port";

export class CacheRepositoryNoopAdapter implements CacheRepositoryPort {
  async get<T>(): Promise<T | null> {
    return null;
  }

  async set() {}

  async delete() {}

  async flush() {}
}
