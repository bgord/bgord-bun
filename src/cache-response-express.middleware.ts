import type { RequestHandler } from "express";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { CacheResponseConfig } from "./cache-response.middleware";
import { CacheResponseMiddleware } from "./cache-response.middleware";
import type { MiddlewareExpressPort } from "./middleware-express.port";
import { RequestContextExpressAdapter } from "./request-context-express.adapter";

type Dependencies = { CacheResolver: CacheResolverStrategy };

export class CacheResponseExpressMiddleware implements MiddlewareExpressPort {
  private readonly middleware: CacheResponseMiddleware;

  constructor(config: CacheResponseConfig, deps: Dependencies) {
    this.middleware = new CacheResponseMiddleware(config, deps);
  }

  handle(): RequestHandler {
    return async (request, response, next) => {
      const context = new RequestContextExpressAdapter(request);

      const originalJson = response.json.bind(response);

      response.json = function (body: unknown) {
        response.locals.body = body;

        if (response.locals.cache) {
          response.setHeader(CacheResponseMiddleware.CACHE_HIT_HEADER, response.locals.cache);
        }
        return originalJson(body);
      };

      const result = await this.middleware.evaluate(context, async () => {
        response.locals.cache = "miss";

        next();

        return {
          body: JSON.stringify(response.locals.body),
          headers: response.getHeaders() as Record<string, string>,
          status: response.statusCode,
        };
      });

      if (!result) return next();

      response.locals.cache = result.source;

      // Cache hit - send cached response
      response.setHeader(CacheResponseMiddleware.CACHE_HIT_HEADER, result.source);
      response.status(result.response.status);
      Object.entries(result.response.headers).forEach(([key, value]) => response.setHeader(key, value));
      response.json(JSON.parse(result.response.body));
    };
  }

  clear(): RequestHandler {
    return async (_request, _response, next) => {
      await this.middleware.clear();
      next();
    };
  }
}
