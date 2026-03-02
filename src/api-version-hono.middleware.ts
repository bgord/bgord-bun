import type { MiddlewareHandler } from "hono";
import { ApiVersionMiddleware } from "./api-version.middleware";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { MiddlewareHonoPort } from "./middleware-hono.port";

type Dependencies = {
  CacheResolver: CacheResolverStrategy;
  HashContent: HashContentStrategy;
  BuildInfoRepository: BuildInfoRepositoryStrategy;
};

export class ApiVersionHonoMiddleware implements MiddlewareHonoPort {
  private readonly middleware: ApiVersionMiddleware;

  constructor(deps: Dependencies) {
    this.middleware = new ApiVersionMiddleware(deps);
  }

  handle(): MiddlewareHandler {
    return async (c, next) => {
      const version = await this.middleware.evaluate();

      c.res.headers.set(ApiVersionMiddleware.HEADER_NAME, version.toString());

      return next();
    };
  }
}
