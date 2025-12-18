import { createMiddleware } from "hono/factory";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { CacheResolverPort } from "./cache-resolver.port";
import type { CacheSubject } from "./cache-subject.vo";

type Dependencies = { CacheResolver: CacheResolverPort };

type CacheResponseOptions = { enabled: boolean; subject: CacheSubject };

type CachedResponse = {
  body: string;
  headers: Record<string, string>;
  status: ContentfulStatusCode;
};

export class CacheResponse {
  static readonly CACHE_HIT_HEADER = "Cache-Hit";

  constructor(
    private readonly config: CacheResponseOptions,
    private readonly deps: Dependencies,
  ) {}

  handle = createMiddleware(async (c, next) => {
    if (!this.config.enabled) return next();

    const subject = this.config.subject.resolve(c);

    const result = await this.deps.CacheResolver.resolveWithContext<CachedResponse>(subject.hex, async () => {
      await next();

      const response = c.res.clone();

      return {
        body: await response.text(),
        headers: response.headers.toJSON(),
        status: response.status as ContentfulStatusCode,
      };
    });

    c.header(CacheResponse.CACHE_HIT_HEADER, result.source);

    return c.newResponse(result.value.body, result.value.status, result.value.headers);
  });

  clear = createMiddleware(async (_c, next) => {
    await this.deps.CacheResolver.flush();

    return next();
  });
}
