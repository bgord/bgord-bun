import * as tools from "@bgord/tools";
import NodeCache from "node-cache";

import { RateLimitStore, RateLimitStoreSubjectType } from "./rate-limit-store.port";

export class NodeCacheRateLimitStore implements RateLimitStore {
  private readonly store: NodeCache;

  constructor(private readonly time: tools.TimeResult) {
    this.store = new NodeCache({
      stdTTL: this.time.seconds,
      checkperiod: this.time.seconds,
      deleteOnExpire: true,
      maxKeys: 100_000,
    });
  }

  async get(subject: RateLimitStoreSubjectType) {
    return this.store.get<tools.RateLimiter>(subject);
  }

  async set(subject: RateLimitStoreSubjectType, limiter: tools.RateLimiter) {
    this.store.set(subject, limiter);
  }
}
