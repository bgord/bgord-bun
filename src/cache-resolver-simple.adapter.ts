import type { CacheRepositoryKeyType, CacheRepositoryPort } from "./cache-repository.port";
import type { CacheResolverPort } from "./cache-resolver.port";

type Dependencies = { CacheRepository: CacheRepositoryPort };

export class CacheResolverSimpleAdapter implements CacheResolverPort {
  constructor(private readonly deps: Dependencies) {}

  async resolve<T>(key: CacheRepositoryKeyType, producer: () => Promise<T>): Promise<T> {
    const cached = await this.deps.CacheRepository.get<T>(key);

    if (cached !== null) return cached;

    const value = await producer();
    await this.deps.CacheRepository.set(key, value);

    return value;
  }
}
