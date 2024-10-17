import { createMiddleware } from "hono/factory";
import NodeCache from "node-cache";
import _ from "lodash";

export enum CacheHitEnum {
  hit = "hit",
  miss = "miss",
}

export class CacheResponse {
  static readonly CACHE_HIT_HEADER = "Cache-Hit";

  constructor(private readonly cache: NodeCache) {}

  handle = createMiddleware(async (c, next) => {
    const url = _.escape(c.req.url);

    if (this.cache.has(url)) {
      c.res.headers.set(CacheResponse.CACHE_HIT_HEADER, CacheHitEnum.hit);

      // @ts-ignore
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