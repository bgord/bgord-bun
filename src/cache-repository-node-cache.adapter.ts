import NodeCache from "node-cache";
import type { CacheRepositoryPort, CacheRepositoryTtlType } from "./cache-repository.port";
import type { CacheValueType } from "./cache-value.vo";
import type { Hash } from "./hash.vo";

export class CacheRepositoryNodeCacheAdapter implements CacheRepositoryPort {
  private readonly store: NodeCache;

  constructor(config: CacheRepositoryTtlType) {
    this.store = new NodeCache({
      stdTTL: config.type === "finite" ? config.ttl.seconds : 0,
      deleteOnExpire: true,
      maxKeys: 100_000,
      useClones: false,
    });
  }

  async get(subject: Hash): Promise<CacheValueType | null> {
    const value = this.store.get<string>(subject.get());

    if (value === undefined) return null;

    return JSON.parse(value);
  }

  async set(subject: Hash, value: CacheValueType): Promise<void> {
    try {
      this.store.set(subject.get(), JSON.stringify(value));
    } catch {}
  }

  async delete(subject: Hash): Promise<void> {
    this.store.del(subject.get());
  }

  async flush(): Promise<void> {
    this.store.flushAll();
  }
}
