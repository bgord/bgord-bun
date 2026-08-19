import type { CacheCodecStrategy } from "./cache-codec.strategy";
import type { Hash } from "./hash.vo";

export interface CacheResolverStrategy {
  resolve<T>(subject: Hash, producer: () => Promise<T>, codec: CacheCodecStrategy<T>): Promise<T>;

  flush(): Promise<void>;
}
