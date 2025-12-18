import type * as tools from "@bgord/tools";
import type { CacheSubjectHexType } from "./cache-subject-hex.vo";

export enum CacheSourceEnum {
  hit = "hit",
  miss = "",
}

export interface CacheResolverPort {
  resolve<T>(subject: CacheSubjectHexType, producer: () => Promise<T>): Promise<T>;

  resolveWithContext<T>(
    subject: CacheSubjectHexType,
    producer: () => Promise<T>,
  ): Promise<{ value: T; source: CacheSourceEnum }>;

  flush(): Promise<void>;

  get ttl(): tools.Duration;
}
