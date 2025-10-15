import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { JsonFileReaderPort } from "./file-reader-json.port";

export type BuildInfoType = { BUILD_DATE: tools.TimestampType; BUILD_VERSION?: string };

type Dependencies = { Clock: ClockPort; JsonFileReader: JsonFileReaderPort };

export class BuildInfoRepository {
  static async extract(deps: Dependencies): Promise<BuildInfoType> {
    const BUILD_DATE = deps.Clock.nowMs();

    try {
      const packageJson = await deps.JsonFileReader.read("package.json");

      return { BUILD_DATE, BUILD_VERSION: tools.PackageVersion.fromString(packageJson.version).toString() };
    } catch {
      return { BUILD_DATE };
    }
  }
}
