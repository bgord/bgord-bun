import { createMiddleware } from "hono/factory";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { CacheResponseConfig } from "./cache-response.middleware";
import { CacheResponseMiddleware } from "./cache-response.middleware";
import type { MiddlewareHonoPort } from "./middleware-hono.port";
import { RequestContextHonoAdapter } from "./request-context-hono.adapter";

type Dependencies = { CacheResolver: CacheResolverStrategy };

export class CacheResponseHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: CacheResponseMiddleware;

  constructor(config: CacheResponseConfig, deps: Dependencies) {
    this.middleware = new CacheResponseMiddleware(config, deps);
  }

  handle() {
    return createMiddleware(async (c, next) => {
      const context = new RequestContextHonoAdapter(c);

      const result = await this.middleware.evaluate(context, async () => {
        await next();

        const response = c.res.clone();

        return {
          body: await response.text(),
          headers: response.headers.toJSON(),
          status: response.status as ContentfulStatusCode,
        };
      });

      if (!result) return next();

      c.header(CacheResponseMiddleware.CACHE_HIT_HEADER, result.source);

      return c.newResponse(
        result.response.body,
        result.response.status as ContentfulStatusCode,
        result.response.headers,
      );
    });
  }

  clear() {
    return createMiddleware(async (_c, next) => {
      await this.middleware.clear();

      return next();
    });
  }
}
