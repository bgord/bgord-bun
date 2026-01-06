import { createMiddleware } from "hono/factory";
import { BuildInfoRepository } from "./build-info-repository.service";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import { CacheSubjectApplicationResolver } from "./cache-subject-application-resolver.vo";
import { CacheSubjectSegmentFixedStrategy } from "./cache-subject-segment-fixed.strategy";
import type { ClockPort } from "./clock.port";
import type { FileReaderJsonPort } from "./file-reader-json.port";
import type { HashContentStrategy } from "./hash-content.strategy";

type Dependencies = {
  Clock: ClockPort;
  FileReaderJson: FileReaderJsonPort;
  CacheResolver: CacheResolverStrategy;
  HashContent: HashContentStrategy;
};

export class ApiVersion {
  static readonly HEADER_NAME = "api-version";
  static readonly DEFAULT_API_VERSION = "unknown";

  static build = (deps: Dependencies) =>
    createMiddleware(async (c, next) => {
      const resolver = new CacheSubjectApplicationResolver(
        [new CacheSubjectSegmentFixedStrategy("api-version")],
        deps,
      );
      const subject = await resolver.resolve();

      const build = await deps.CacheResolver.resolve(subject.hex, async () =>
        BuildInfoRepository.extract(deps),
      );
      c.res.headers.set(ApiVersion.HEADER_NAME, build.BUILD_VERSION ?? ApiVersion.DEFAULT_API_VERSION);
      await next();
    });
}
