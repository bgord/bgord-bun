import type * as tools from "@bgord/tools";
import type { BuildInfoRepositoryPort } from "./build-info-repository.strategy";

export class BuildInfoRepositoryNoopStrategy implements BuildInfoRepositoryPort {
  constructor(
    private readonly timestamp: tools.Timestamp,
    private readonly version?: tools.PackageVersion,
  ) {}

  async extract() {
    return { BUILD_DATE: this.timestamp, BUILD_VERSION: this.version };
  }
}
