import type * as tools from "@bgord/tools";
import type { CacheSubjectType } from "./cache-subject.vo";

export enum CacheSourceEnum {
  hit = "hit",
  miss = "",
}

export interface CacheResolverPort {
  resolve<T>(subject: CacheSubjectType, producer: () => Promise<T>): Promise<T>;

  resolveWithContext<T>(
    subject: CacheSubjectType,
    producer: () => Promise<T>,
  ): Promise<{ value: T; source: CacheSourceEnum }>;

  flush(): Promise<void>;

  get ttl(): tools.Duration;
}
