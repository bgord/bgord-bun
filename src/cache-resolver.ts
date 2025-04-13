import { Context } from "hono";
import NodeCache, { Key } from "node-cache";

export enum CacheHitOptions {
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
  meta: { hit: CacheHitOptions };
};

type CacheResolverRequestHeadersResult<T> = {
  data: T;
  header: {
    name: "cache-hit";
    value: CacheHitOptions;
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
          meta: { hit: hit ? CacheHitOptions.hit : CacheHitOptions.miss },
        };

      case CacheResolverStrategy.request_headers:
        return {
          data,
          respond: (c: Context) => {
            c.header("cache-hit", hit ? CacheHitOptions.hit : CacheHitOptions.miss);

            // @ts-ignore
            return c.json(data);
          },
          header: {
            name: "cache-hit",
            value: hit ? CacheHitOptions.hit : CacheHitOptions.miss,
          },
        };

      default:
        return { data };
    }
  }
}
