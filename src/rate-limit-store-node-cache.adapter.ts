import type * as tools from "@bgord/tools";
import NodeCache from "node-cache";
import type { RateLimitStorePort, RateLimitStoreSubjectType } from "./rate-limit-store.port";

export class RateLimitStoreNodeCacheAdapter implements RateLimitStorePort {
  private readonly store: NodeCache;

  constructor(readonly ttl: tools.Duration) {
    this.store = new NodeCache({
      stdTTL: this.ttl.seconds,
      checkperiod: this.ttl.seconds,
      deleteOnExpire: true,
      maxKeys: 100_000,
      useClones: false,
    });
  }

  async get(subject: RateLimitStoreSubjectType) {
    return this.store.get<tools.RateLimiter>(subject);
  }

  async set(subject: RateLimitStoreSubjectType, limiter: tools.RateLimiter) {
    this.store.set(subject, limiter);
  }

  flushAll() {
    this.store.flushAll();
  }
}
