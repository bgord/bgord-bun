import type * as tools from "@bgord/tools";
import type { CacheSubjectHexType } from "./cache-subject-hex.vo";

export interface CacheRepositoryPort {
  get<T>(subject: CacheSubjectHexType): Promise<T | null>;
  set<T>(subject: CacheSubjectHexType, value: T): Promise<void>;
  delete(subject: CacheSubjectHexType): Promise<void>;
  flush(): Promise<void>;
  get ttl(): tools.Duration;
}
