import type * as tools from "@bgord/tools";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { CommitSha } from "./commit-sha.vo";

export class BuildInfoRepositoryNoopStrategy implements BuildInfoRepositoryStrategy {
  constructor(
    private readonly timestamp: tools.Timestamp,
    private readonly version: tools.PackageVersion,
    private readonly sha: CommitSha,
  ) {}

  async extract() {
    return { timestamp: this.timestamp, version: this.version, sha: this.sha };
  }
}
