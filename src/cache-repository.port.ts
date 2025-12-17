export type CacheRepositoryKeyType = string;

export interface CacheRepositoryPort {
  get<T>(key: CacheRepositoryKeyType): Promise<T | null>;
  set<T>(key: CacheRepositoryKeyType, value: T): Promise<void>;
  delete(key: CacheRepositoryKeyType): Promise<void>;
  flush(): Promise<void>;
}
