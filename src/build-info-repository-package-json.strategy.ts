import * as tools from "@bgord/tools";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import type { ClockPort } from "./clock.port";
import type { FileReaderJsonPort } from "./file-reader-json.port";

type Dependencies = { Clock: ClockPort; FileReaderJson: FileReaderJsonPort };

export class BuildInfoRepositoryPackageJsonStrategy implements BuildInfoRepositoryStrategy {
  constructor(private readonly deps: Dependencies) {}

  async extract() {
    const BUILD_DATE = this.deps.Clock.now();

    try {
      const packageJson = await this.deps.FileReaderJson.read("package.json");

      return { BUILD_DATE, BUILD_VERSION: tools.PackageVersion.fromString(packageJson.version) };
    } catch {
      return { BUILD_DATE };
    }
  }
}
