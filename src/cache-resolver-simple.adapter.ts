import type { CacheRepositoryKeyType, CacheRepositoryPort } from "./cache-repository.port";
import { type CacheResolverPort, CacheSourceEnum } from "./cache-resolver.port";

type Dependencies = { CacheRepository: CacheRepositoryPort };

export class CacheResolverSimpleAdapter implements CacheResolverPort {
  constructor(private readonly deps: Dependencies) {}

  async resolve<T>(key: CacheRepositoryKeyType, producer: () => Promise<T>): Promise<T> {
    const result = await this.resolveWithContext(key, producer);

    return result.value;
  }

  async resolveWithContext<T>(
    key: CacheRepositoryKeyType,
    producer: () => Promise<T>,
  ): Promise<{ value: T; source: CacheSourceEnum }> {
    const cached = await this.deps.CacheRepository.get<T>(key);

    if (cached !== null) return { value: cached, source: CacheSourceEnum.hit };

    const value = await producer();
    await this.deps.CacheRepository.set(key, value);

    return { value, source: CacheSourceEnum.miss };
  }

  getTTL() {
    return this.deps.CacheRepository.getTTL();
  }
}
