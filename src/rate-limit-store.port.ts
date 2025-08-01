import * as tools from "@bgord/tools";

export type RateLimitStoreSubjectType = string;

export interface RateLimitStore {
  get(subject: RateLimitStoreSubjectType): tools.RateLimiter | undefined;
  set(subject: RateLimitStoreSubjectType, limiter: tools.RateLimiter): void;
}
