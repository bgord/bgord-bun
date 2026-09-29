import type { CacheRepositoryPort } from "./cache-repository.port";
import type { Hash } from "./hash.vo";
import type { IdempotencyStorePort } from "./idempotency-store.port";

type Dependencies = { CacheRepository: CacheRepositoryPort };

export class IdempotencyStoreCacheAdapter implements IdempotencyStorePort {
  constructor(private readonly deps: Dependencies) {}

  // Non-atomic get-then-set: concurrent claims of the same subject can both succeed
  async claim(subject: Hash): Promise<boolean> {
    const processed = await this.deps.CacheRepository.get(subject);

    if (processed !== null) return false;

    await this.deps.CacheRepository.set(subject, true);

    return true;
  }
}
