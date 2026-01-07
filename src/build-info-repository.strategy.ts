import type * as tools from "@bgord/tools";

export type BuildInfoType = { BUILD_DATE: tools.Timestamp; BUILD_VERSION?: tools.PackageVersion };

export interface BuildInfoRepositoryStrategy {
  extract(): Promise<BuildInfoType>;
}
