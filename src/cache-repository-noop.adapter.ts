import type { CacheRepositoryPort } from "./cache-repository.port";
import type { CacheValueType } from "./cache-value.vo";
import type { Hash } from "./hash.vo";

export class CacheRepositoryNoopAdapter implements CacheRepositoryPort {
  async get(_subject: Hash): Promise<CacheValueType | null> {
    return null;
  }
  async set(_subject: Hash, _value: CacheValueType): Promise<void> {}
  async delete(_subject: Hash): Promise<void> {}
  async flush(): Promise<void> {}
}
