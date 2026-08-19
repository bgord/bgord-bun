import type { CacheCodecStrategy } from "./cache-codec.strategy";
import type { CacheRepositoryPort } from "./cache-repository.port";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { Hash } from "./hash.vo";

type Dependencies = { CacheRepository: CacheRepositoryPort };

export class CacheResolverSimpleStrategy implements CacheResolverStrategy {
  constructor(private readonly deps: Dependencies) {}

  async resolve<T>(subject: Hash, producer: () => Promise<T>, codec: CacheCodecStrategy<T>): Promise<T> {
    const cached = await this.deps.CacheRepository.get(subject);

    if (cached !== null) return codec.decode(cached);

    const value = await producer();
    await this.deps.CacheRepository.set(subject, codec.encode(value));

    return value;
  }

  async flush(): Promise<void> {
    await this.deps.CacheRepository.flush();
  }
}
