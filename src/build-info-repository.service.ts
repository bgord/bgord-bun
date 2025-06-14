import * as tools from "@bgord/tools";

export type BuildInfoType = {
  BUILD_DATE: tools.TimestampType;
  BUILD_VERSION?: tools.BuildVersionType;
};

export class BuildInfoRepository {
  static async extract(): Promise<BuildInfoType> {
    const BUILD_DATE = tools.Timestamp.parse(Date.now());

    try {
      const packageJson = await BuildInfoRepository.getPackageJson();

      const BUILD_VERSION = tools.BuildVersion.parse(packageJson.version);

      return { BUILD_DATE, BUILD_VERSION };
    } catch (error) {
      return { BUILD_DATE };
    }
  }

  static async getPackageJson() {
    return Bun.file("package.json").json();
  }
}
