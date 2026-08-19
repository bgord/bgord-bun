import type { CacheValueType } from "./cache-value.vo";

export interface CacheCodecStrategy<T> {
  encode(value: T): CacheValueType;
  decode(raw: CacheValueType): T;
}
