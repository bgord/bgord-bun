import { createMiddleware } from "hono/factory";
import _ from "lodash";
import type NodeCache from "node-cache";
import { CacheHitEnum } from "./cache-resolver.service";

export class CacheResponse {
  static readonly CACHE_HIT_HEADER = "Cache-Hit";

  constructor(private readonly cache: NodeCache) {}

  handle = createMiddleware(async (c, next) => {
    const url = _.escape(c.req.url);

    if (this.cache.has(url)) {
      c.res.headers.set(CacheResponse.CACHE_HIT_HEADER, CacheHitEnum.hit);
      // @ts-expect-error
      return c.json(this.cache.get(url));
    }

    c.res.headers.set(CacheResponse.CACHE_HIT_HEADER, CacheHitEnum.miss);
    return next();
  });

  clear = createMiddleware(async (_c, next) => {
    this.cache.flushAll();
    return next();
  });
}
