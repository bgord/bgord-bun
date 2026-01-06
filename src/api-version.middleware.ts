import { createMiddleware } from "hono/factory";
import type { BuildInfoRepositoryPort } from "./build-info-repository.strategy";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import { CacheSubjectApplicationResolver } from "./cache-subject-application-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "./cache-subject-segment-fixed.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";

type Dependencies = {
  CacheResolver: CacheResolverStrategy;
  HashContent: HashContentStrategy;
  BuildInfoRepository: BuildInfoRepositoryPort;
};

export class ApiVersion {
  static readonly HEADER_NAME = "api-version";
  static readonly DEFAULT_API_VERSION = "unknown";

  static build = (deps: Dependencies) =>
    createMiddleware(async (context, next) => {
      const resolver = new CacheSubjectApplicationResolver(
        [new CacheSubjectSegmentFixedStrategy("api-version")],
        deps,
      );
      const subject = await resolver.resolve();

      const build = await deps.CacheResolver.resolve(subject.hex, async () =>
        deps.BuildInfoRepository.extract(),
      );
      context.res.headers.set(
        ApiVersion.HEADER_NAME,
        build.BUILD_VERSION?.toString() ?? ApiVersion.DEFAULT_API_VERSION,
      );
      await next();
    });
}
