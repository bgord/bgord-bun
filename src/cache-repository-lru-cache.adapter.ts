import type { LRUCache } from "lru-cache";
import type { CacheRepositoryPort, CacheRepositoryTtlType } from "./cache-repository.port";
import type { Hash } from "./hash.vo";
import type { HashValueType } from "./hash-value.vo";

export const CacheRepositoryLruCacheAdapterError = {
  MissingDependency: "cache.repository.lru.cache.adapter.error.missing.dependency",
};

export class CacheRepositoryLruCacheAdapter implements CacheRepositoryPort {
  private readonly store: LRUCache<HashValueType, any>;

  private constructor(store: LRUCache<HashValueType, any>) {
    this.store = store;
  }

  static async build(config: CacheRepositoryTtlType): Promise<CacheRepositoryLruCacheAdapter> {
    // biome-ignore lint: lint/suspicious/noAssignInExpressions
    let LRUCacheConstructor;

    try {
      const module = await CacheRepositoryLruCacheAdapter.imports();

      LRUCacheConstructor = module.LRUCache;
    } catch {
      throw new Error(CacheRepositoryLruCacheAdapterError.MissingDependency);
    }

    const store = new LRUCacheConstructor<HashValueType, any>({
      max: 100_000,
      ttl: config.type === "finite" ? config.ttl.ms : undefined,
      ttlAutopurge: true,
    });

    return new CacheRepositoryLruCacheAdapter(store);
  }

  static async imports() {
    return import("lru-cache");
  }

  async get<T>(subject: Hash): Promise<T | null> {
    return (this.store.get(subject.get()) as T) ?? null;
  }

  async set<T>(subject: Hash, value: T): Promise<void> {
    this.store.set(subject.get(), value);
  }

  async delete(subject: Hash): Promise<void> {
    this.store.delete(subject.get());
  }

  async flush(): Promise<void> {
    this.store.clear();
  }
}
