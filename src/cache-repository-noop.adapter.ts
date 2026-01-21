import type { CacheRepositoryPort, CacheRepositoryTtlType } from "./cache-repository.port";

export class CacheRepositoryNoopAdapter implements CacheRepositoryPort {
  constructor(_config: CacheRepositoryTtlType) {}

  async get<T>(): Promise<T | null> {
    return null;
  }

  async set(): Promise<void> {}

  async delete(): Promise<void> {}

  async flush(): Promise<void> {}
}
