import type * as tools from "@bgord/tools";
import NodeCache from "node-cache";
import type { CacheRepositoryPort } from "./cache-repository.port";
import type { CacheSubjectType } from "./cache-subject.vo";

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

  async get<T>(subject: CacheSubjectType): Promise<T | null> {
    return this.store.get(subject) ?? null;
  }

  async set<T>(subject: CacheSubjectType, value: T) {
    this.store.set(subject, value);
  }

  async delete(subject: CacheSubjectType) {
    this.store.del(subject);
  }

  async flush() {
    this.store.flushAll();
  }

  get ttl() {
    return this.config.ttl;
  }
}
