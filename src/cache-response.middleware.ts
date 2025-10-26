import { createMiddleware } from "hono/factory";
import type NodeCache from "node-cache";
import { CacheHitEnum } from "./cache-resolver.service";

export class CacheResponse {
  static readonly CACHE_HIT_HEADER = "Cache-Hit";

  constructor(private readonly cache: NodeCache) {}

  handle = createMiddleware(async (c, next) => {
    const url = c.req.url;

    if (this.cache.has(url)) {
      c.res.headers.set(CacheResponse.CACHE_HIT_HEADER, CacheHitEnum.hit);

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
