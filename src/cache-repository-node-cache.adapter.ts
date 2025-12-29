import NodeCache from "node-cache";
import type { CacheRepositoryPort, CacheRepositoryTtlType } from "./cache-repository.port";
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

  async get<T>(subject: Hash): Promise<T | null> {
    return this.store.get(subject.get()) ?? null;
  }

  async set<T>(subject: Hash, value: T) {
    this.store.set(subject.get(), value);
  }

  async delete(subject: Hash) {
    this.store.del(subject.get());
  }

  async flush() {
    this.store.flushAll();
  }
}
