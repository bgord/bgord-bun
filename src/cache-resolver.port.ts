import type { CacheRepositoryKeyType } from "./cache-repository.port";

export interface CacheResolverPort {
  resolve<T>(key: CacheRepositoryKeyType, producer: () => Promise<T>): Promise<T>;
}
