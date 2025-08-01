import * as tools from "@bgord/tools";

export type RateLimitStoreSubjectType = string;

export interface RateLimitStore {
  get(subject: RateLimitStoreSubjectType): Promise<tools.RateLimiter | undefined>;
  set(subject: RateLimitStoreSubjectType, limiter: tools.RateLimiter): Promise<void>;
}
