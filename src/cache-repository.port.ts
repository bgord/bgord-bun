import type { Hash } from "./hash.vo";

export interface CacheRepositoryPort {
  get<T>(subject: Hash): Promise<T | null>;
  set<T>(subject: Hash, value: T): Promise<void>;
  delete(subject: Hash): Promise<void>;
  flush(): Promise<void>;
}
