export type CacheValueType =
  | string
  | number
  | boolean
  | null
  | ReadonlyArray<CacheValueType>
  | { readonly [key: string]: CacheValueType | undefined };
