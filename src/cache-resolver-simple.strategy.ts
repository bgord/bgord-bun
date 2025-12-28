import type { CacheRepositoryPort } from "./cache-repository.port";
import { type CacheResolverStrategy, CacheSourceEnum } from "./cache-resolver.strategy";
import type { Hash } from "./hash.vo";

type Dependencies = { CacheRepository: CacheRepositoryPort };

export class CacheResolverSimpleStrategy implements CacheResolverStrategy {
  constructor(private readonly deps: Dependencies) {}

  async resolve<T>(subject: Hash, producer: () => Promise<T>): Promise<T> {
    const result = await this.resolveWithContext(subject, producer);

    return result.value;
  }

  async resolveWithContext<T>(
    subject: Hash,
    producer: () => Promise<T>,
  ): Promise<{ value: T; source: CacheSourceEnum }> {
    const cached = await this.deps.CacheRepository.get<T>(subject);

    if (cached !== null) return { value: cached, source: CacheSourceEnum.hit };

    const value = await producer();
    await this.deps.CacheRepository.set(subject, value);

    return { value, source: CacheSourceEnum.miss };
  }

  async flush() {
    await this.deps.CacheRepository.flush();
  }

  get ttl() {
    return this.deps.CacheRepository.ttl;
  }
}
