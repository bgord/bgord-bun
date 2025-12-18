import type * as tools from "@bgord/tools";
import type { CacheSubjectType } from "./cache-subject.vo";

export interface CacheRepositoryPort {
  get<T>(subject: CacheSubjectType): Promise<T | null>;
  set<T>(subject: CacheSubjectType, value: T): Promise<void>;
  delete(subject: CacheSubjectType): Promise<void>;
  flush(): Promise<void>;
  get ttl(): tools.Duration;
}
