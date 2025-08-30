import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";

export type BuildInfoType = {
  BUILD_DATE: tools.TimestampType;
  BUILD_VERSION?: tools.BuildVersionType;
};

type Dependencies = { Clock: ClockPort };

export class BuildInfoRepository {
  static async extract(deps: Dependencies): Promise<BuildInfoType> {
    const BUILD_DATE = deps.Clock.nowMs();

    try {
      const packageJson = await BuildInfoRepository.getPackageJson();

      const BUILD_VERSION = tools.BuildVersion.parse(packageJson.version);

      return { BUILD_DATE, BUILD_VERSION };
    } catch (_error) {
      return { BUILD_DATE };
    }
  }

  static async getPackageJson() {
    return Bun.file("package.json").json();
  }
}
