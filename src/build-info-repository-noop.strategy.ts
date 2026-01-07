import type * as tools from "@bgord/tools";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";

export class BuildInfoRepositoryNoopStrategy implements BuildInfoRepositoryStrategy {
  constructor(
    private readonly timestamp: tools.Timestamp,
    private readonly version: tools.PackageVersion,
  ) {}

  async extract() {
    return { timestamp: this.timestamp, version: this.version };
  }
}
