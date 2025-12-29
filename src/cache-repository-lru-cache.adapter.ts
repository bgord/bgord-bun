import { LRUCache } from "lru-cache";
import type { CacheRepositoryPort, CacheRepositoryTtlType } from "./cache-repository.port";
import type { Hash } from "./hash.vo";
import type { HashValueType } from "./hash-value.vo";

export class CacheRepositoryLruCacheAdapter implements CacheRepositoryPort {
  private readonly store;

  constructor(config: CacheRepositoryTtlType) {
    this.store = new LRUCache<HashValueType, any>({
      max: 100_000,
      ttl: config.type === "finite" ? config.ttl.ms : undefined,
      ttlAutopurge: true,
    });
  }

  async get<T>(subject: Hash): Promise<T | null> {
    return (this.store.get(subject.get()) as T) ?? null;
  }

  async set<T>(subject: Hash, value: T) {
    this.store.set(subject.get(), value);
  }

  async delete(subject: Hash) {
    this.store.delete(subject.get());
  }

  async flush() {
    this.store.clear();
  }
}
