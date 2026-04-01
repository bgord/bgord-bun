import type * as tools from "@bgord/tools";
import type { BuildInfoType } from "./build-info.vo";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { ReactiveConfigPort } from "./reactive-config.port";
import { SubjectApplicationResolver } from "./subject-application-resolver.vo";
import { SubjectSegmentFixedStrategy } from "./subject-segment-fixed.strategy";

type Dependencies = {
  CacheResolver: CacheResolverStrategy;
  HashContent: HashContentStrategy;
  BuildInfoConfig: ReactiveConfigPort<BuildInfoType>;
};

export class ApiVersionMiddleware {
  static readonly HEADER_NAME = "api-version";

  private readonly resolver: SubjectApplicationResolver;

  constructor(private readonly deps: Dependencies) {
    this.resolver = new SubjectApplicationResolver(
      [new SubjectSegmentFixedStrategy("api-version")],
      this.deps,
    );
  }

  async evaluate(): Promise<tools.PackageVersionSchemaType> {
    const subject = await this.resolver.resolve();

    const build = await this.deps.CacheResolver.resolve(subject.hex, async () =>
      this.deps.BuildInfoConfig.get(),
    );

    return build.version;
  }
}
