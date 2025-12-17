import type { Context } from "hono";
import { createMiddleware } from "hono/factory";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { CacheResolverPort } from "./cache-resolver.port";

type SubjectResolver = (c: Context) => string;

type Dependencies = { CacheResolver: CacheResolverPort };

type CacheResponseOptions = { enabled: boolean; subject: SubjectResolver };

export const CacheResponseSubjectUrl: SubjectResolver = (c: Context) => c.req.url;

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

    const subject = this.config.subject(c);

    const result = await this.deps.CacheResolver.resolveWithContext<CachedResponse>(subject, async () => {
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
