import { createMiddleware } from "hono/factory";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { CacheSubjectRequestResolver } from "./cache-subject-request-resolver.vo";

type Dependencies = { CacheResolver: CacheResolverStrategy };

type CacheResponseOptions = { enabled: boolean; resolver: CacheSubjectRequestResolver };

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

  handle = createMiddleware(async (context, next) => {
    if (!this.config.enabled) return next();

    const subject = await this.config.resolver.resolve(context);

    const result = await this.deps.CacheResolver.resolveWithContext<CachedResponse>(subject.hex, async () => {
      await next();

      const response = context.res.clone();

      return {
        body: await response.text(),
        headers: response.headers.toJSON(),
        status: response.status as ContentfulStatusCode,
      };
    });

    context.header(CacheResponse.CACHE_HIT_HEADER, result.source);

    return context.newResponse(result.value.body, result.value.status, result.value.headers);
  });

  clear = createMiddleware(async (_c, next) => {
    await this.deps.CacheResolver.flush();

    return next();
  });
}
