import type * as tools from "@bgord/tools";
import NodeCache from "node-cache";
import type { CacheRepositoryPort } from "./cache-repository.port";
import type { Hash } from "./hash.vo";

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

  get ttl() {
    return this.config.ttl;
  }
}
