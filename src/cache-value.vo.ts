type CacheJsonType =
  | string
  | number
  | boolean
  | null
  | ReadonlyArray<CacheJsonType>
  | { readonly [key: string]: CacheJsonType | undefined };

export type CacheValueType = Exclude<CacheJsonType, null>;
