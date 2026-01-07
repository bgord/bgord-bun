import * as tools from "@bgord/tools";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { ClockPort } from "./clock.port";
import type { FileReaderJsonPort } from "./file-reader-json.port";

type Dependencies = { Clock: ClockPort; FileReaderJson: FileReaderJsonPort };

export class BuildInfoRepositoryPackageJsonStrategy implements BuildInfoRepositoryStrategy {
  constructor(private readonly deps: Dependencies) {}

  async extract() {
    const timestamp = this.deps.Clock.now();

    try {
      const packageJson = await this.deps.FileReaderJson.read("package.json");

      return { timestamp, version: tools.PackageVersion.fromString(packageJson.version) };
    } catch {
      return { timestamp, version: tools.PackageVersion.fromString("0.0.0") };
    }
  }
}
