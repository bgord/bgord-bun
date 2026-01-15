import * as tools from "@bgord/tools";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { ClockPort } from "./clock.port";
import { CommitSha } from "./commit-sha.vo";
import type { FileReaderJsonPort } from "./file-reader-json.port";

type Dependencies = { Clock: ClockPort; FileReaderJson: FileReaderJsonPort };

export class BuildInfoRepositoryPackageJsonStrategy implements BuildInfoRepositoryStrategy {
  constructor(private readonly deps: Dependencies) {}

  async extract() {
    const timestamp = this.deps.Clock.now();
    const sha = CommitSha.fromString("a".repeat(40));
    const size = tools.Size.fromBytes(0);

    try {
      const packageJson = await this.deps.FileReaderJson.read("package.json");

      return { timestamp, version: tools.PackageVersion.fromString(packageJson.version), sha, size };
    } catch {
      return { timestamp, version: tools.PackageVersion.fromString("0.0.0"), sha, size };
    }
  }
}
