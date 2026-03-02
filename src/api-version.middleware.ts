import { createMiddleware } from "hono/factory";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";
import { SubjectApplicationResolver } from "./subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "./subject-segment-fixed.strategy";

type Dependencies = {
  CacheResolver: CacheResolverStrategy;
  HashContent: HashContentStrategy;
  BuildInfoRepository: BuildInfoRepositoryStrategy;
};

export class ApiVersion {
  static readonly HEADER_NAME = "api-version";

  static build = (deps: Dependencies) =>
    createMiddleware(async (c, next) => {
      const resolver = new SubjectApplicationResolver([new SubjectSegmentFixedStrategy("api-version")], deps);
      const subject = await resolver.resolve();

      const build = await deps.CacheResolver.resolve(subject.hex, async () =>
        deps.BuildInfoRepository.extract(),
      );
      c.res.headers.set(ApiVersion.HEADER_NAME, build.version.toString());
      await next();
    });
}
