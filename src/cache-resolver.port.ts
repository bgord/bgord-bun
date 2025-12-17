import type * as tools from "@bgord/tools";
import type { CacheRepositoryKeyType } from "./cache-repository.port";

export enum CacheSourceEnum {
  hit = "hit",
  miss = "",
}

export interface CacheResolverPort {
  resolve<T>(key: CacheRepositoryKeyType, producer: () => Promise<T>): Promise<T>;

  resolveWithContext<T>(
    key: CacheRepositoryKeyType,
    producer: () => Promise<T>,
  ): Promise<{ value: T; source: CacheSourceEnum }>;

  get ttl(): tools.Duration;
}
