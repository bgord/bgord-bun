import type * as tools from "@bgord/tools";
import NodeCache from "node-cache";
import type { CacheRepositoryKeyType, CacheRepositoryPort } from "./cache-repository.port";

export class CacheRepositoryNodeCacheAdapter implements CacheRepositoryPort {
  private readonly store: NodeCache;

  constructor(private readonly config: { ttl: tools.Duration }) {
    this.store = new NodeCache({
      stdTTL: config.ttl.seconds,
      checkperiod: config.ttl.seconds,
      deleteOnExpire: true,
      maxKeys: 100_000,
      useClones: false,
    });
  }

  async get<T>(key: CacheRepositoryKeyType): Promise<T | null> {
    return this.store.get(key) ?? null;
  }

  async set<T>(key: CacheRepositoryKeyType, value: T) {
    this.store.set(key, value);
  }

  async delete(key: CacheRepositoryKeyType) {
    this.store.del(key);
  }

  async flush() {
    this.store.flushAll();
  }

  getTTL() {
    return this.config.ttl;
  }
}
