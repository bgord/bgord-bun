import type * as tools from "@bgord/tools";
import type { CacheValueType } from "./cache-value.vo";
import type { Hash } from "./hash.vo";

export type CacheRepositoryTtlType = { type: "finite"; ttl: tools.Duration } | { type: "infinite" };

export interface CacheRepositoryPort {
  get(subject: Hash): Promise<CacheValueType | null>;
  set(subject: Hash, value: CacheValueType): Promise<void>;
  delete(subject: Hash): Promise<void>;
  flush(): Promise<void>;
}
