import type { CacheRepositoryPort } from "./cache-repository.port";
import type { Hash } from "./hash.vo";
import type { IdempotencyStorePort } from "./idempotency-store.port";

type Config = { CacheRepository: CacheRepositoryPort };

export class IdempotencyStoreCacheAdapter implements IdempotencyStorePort {
  constructor(private readonly config: Config) {}

  async claim(subject: Hash): Promise<boolean> {
    const processed = await this.config.CacheRepository.get(subject);

    if (processed !== null) return false;

    await this.config.CacheRepository.set(subject, true);

    return true;
  }
}
