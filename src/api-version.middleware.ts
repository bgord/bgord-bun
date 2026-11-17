import type * as tools from "@bgord/tools";
import type { BuildInfoType } from "./build-info.vo";
import type { CacheResolverStrategy } from "./cache-resolver.strategy";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { ReactiveConfigPort } from "./reactive-config.port";
import { ReactiveConfigWithCacheAdapter } from "./reactive-config-with-cache.adapter";

export type ApiVersionMiddlewareDependencies = {
  CacheResolver: CacheResolverStrategy;
  HashContent: HashContentStrategy;
  BuildInfoConfig: ReactiveConfigPort<BuildInfoType>;
};

export class ApiVersionMiddleware {
  static readonly HEADER_NAME = "api-version";

  private readonly config: ReactiveConfigPort<BuildInfoType>;

  constructor(deps: ApiVersionMiddlewareDependencies) {
    this.config = new ReactiveConfigWithCacheAdapter(deps.BuildInfoConfig, "api-version", deps);
  }

  async evaluate(): Promise<tools.PackageVersionSchemaType> {
    const config = await this.config.get();

    return config.version;
  }
}
