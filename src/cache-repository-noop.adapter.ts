import type { CacheRepositoryPort } from "./cache-repository.port";

export class CacheRepositoryNoopAdapter implements CacheRepositoryPort {
  async get<T>(): Promise<T | null> {
    return null;
  }

  async set(): Promise<void> {}

  async delete(): Promise<void> {}

  async flush(): Promise<void> {}
}
