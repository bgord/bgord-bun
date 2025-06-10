import { Context } from "hono";
import NodeCache, { Key } from "node-cache";

export enum CacheHitEnum {
  hit = "hit",
  miss = "miss",
}

export enum CacheResolverStrategy {
  simple = "simple",
  with_metadata = "with_metadata",
  request_headers = "request_headers",
}

type Resolver<T> = () => Promise<T>;

type BaseOptions<T> = { key: Key; resolver: Resolver<T> };

type CacheResolverSimpleResult<T> = { data: T };

type CacheResolverWithMetadataResult<T> = {
  data: T;
  meta: { hit: CacheHitEnum };
};

type CacheResolverRequestHeadersResult<T> = {
  data: T;
  header: {
    name: "cache-hit";
    value: CacheHitEnum;
  };
  respond: (c: Context) => Promise<void>;
};

export class CacheResolver {
  static async resolve<T>(
    cache: NodeCache,
    options: BaseOptions<T> & { strategy?: CacheResolverStrategy.simple },
  ): Promise<CacheResolverSimpleResult<T>>;

  static async resolve<T>(
    cache: NodeCache,
    options: BaseOptions<T> & { strategy: CacheResolverStrategy.with_metadata },
  ): Promise<CacheResolverWithMetadataResult<T>>;

  static async resolve<T>(
    cache: NodeCache,
    options: BaseOptions<T> & {
      strategy: CacheResolverStrategy.request_headers;
    },
  ): Promise<CacheResolverRequestHeadersResult<T>>;

  static async resolve<T>(
    cache: NodeCache,
    options: BaseOptions<T> & { strategy?: CacheResolverStrategy },
  ): Promise<any> {
    const strategy = options.strategy ?? CacheResolverStrategy.simple;

    const cached = cache.get<T>(options.key);

    const hit = cached !== undefined;

    const data = hit ? cached : await options.resolver();

    if (!hit) cache.set(options.key, data);

    switch (strategy) {
      case CacheResolverStrategy.with_metadata:
        return {
          data,
          meta: { hit: hit ? CacheHitEnum.hit : CacheHitEnum.miss },
        };

      case CacheResolverStrategy.request_headers:
        return {
          data,
          respond: (c: Context) => {
            c.header("cache-hit", hit ? CacheHitEnum.hit : CacheHitEnum.miss);

            // @ts-expect-error
            return c.json(data);
          },
          header: {
            name: "cache-hit",
            value: hit ? CacheHitEnum.hit : CacheHitEnum.miss,
          },
        };

      default:
        return { data };
    }
  }
}
