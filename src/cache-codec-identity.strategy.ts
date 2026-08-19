import type { CacheCodecStrategy } from "./cache-codec.strategy";
import type { CacheValueType } from "./cache-value.vo";

export class CacheCodecIdentityStrategy<T extends CacheValueType> implements CacheCodecStrategy<T> {
  encode(value: T): CacheValueType {
    return value;
  }

  decode(raw: CacheValueType): T {
    return raw as T;
  }
}
