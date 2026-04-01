import type { CacheRepositoryPort } from "./cache-repository.port";
import type { Hash } from "./hash.vo";

export class CacheRepositoryNoopAdapter implements CacheRepositoryPort {
  async get<T>(_subject: Hash): Promise<T | null> {
    return null;
  }
  async set<T>(_subject: Hash, _value: T): Promise<void> {}
  async delete(_subject: Hash): Promise<void> {}
  async flush(): Promise<void> {}
}
