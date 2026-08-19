import type { CacheCodecStrategy } from "./cache-codec.strategy";
import type { Hash } from "./hash.vo";

export enum CacheSourceEnum {
  hit = "hit",
  miss = "miss",
}

export interface CacheResolverStrategy {
  resolve<T>(subject: Hash, producer: () => Promise<T>, codec: CacheCodecStrategy<T>): Promise<T>;

  resolveWithContext<T>(
    subject: Hash,
    producer: () => Promise<T>,
    codec: CacheCodecStrategy<T>,
  ): Promise<{ value: T; source: CacheSourceEnum }>;

  flush(): Promise<void>;
}
