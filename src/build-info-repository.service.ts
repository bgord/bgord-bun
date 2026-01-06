import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { FileReaderJsonPort } from "./file-reader-json.port";

export type BuildInfoType = { BUILD_DATE: tools.TimestampValueType; BUILD_VERSION?: tools.PackageVersion };

type Dependencies = { Clock: ClockPort; FileReaderJson: FileReaderJsonPort };

export class BuildInfoRepository {
  constructor(private readonly deps: Dependencies) {}

  async extract(): Promise<BuildInfoType> {
    const BUILD_DATE = this.deps.Clock.now().ms;

    try {
      const packageJson = await this.deps.FileReaderJson.read("package.json");

      return { BUILD_DATE, BUILD_VERSION: tools.PackageVersion.fromString(packageJson.version) };
    } catch {
      return { BUILD_DATE };
    }
  }
}
