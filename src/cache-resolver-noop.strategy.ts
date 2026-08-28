import type { CacheCodecStrategy } from "./cache-codec.strategy";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { Hash } from "./hash.vo";

export class CacheResolverNoopStrategy implements CacheResolverStrategy {
  async resolve<T>(_subject: Hash, producer: () => Promise<T>, _codec: CacheCodecStrategy<T>): Promise<T> {
    return producer();
  }

  async flush(): Promise<void> {}
}
