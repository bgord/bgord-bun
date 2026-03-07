import type { RequestHandler } from "express";
import { ApiVersionMiddleware } from "./api-version.middleware";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { MiddlewareExpressPort } from "./middleware-express.port";

type Dependencies = {
  CacheResolver: CacheResolverStrategy;
  HashContent: HashContentStrategy;
  BuildInfoRepository: BuildInfoRepositoryStrategy;
};

export class ApiVersionExpressMiddleware implements MiddlewareExpressPort {
  private readonly middleware: ApiVersionMiddleware;

  constructor(deps: Dependencies) {
    this.middleware = new ApiVersionMiddleware(deps);
  }

  handle(): RequestHandler {
    return async (_request, response, next) => {
      const version = await this.middleware.evaluate();

      response.setHeader(ApiVersionMiddleware.HEADER_NAME, version.toString());

      next();
    };
  }
}
