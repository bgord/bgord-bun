import type * as tools from "@bgord/tools";

export type BuildInfoType = { BUILD_DATE: tools.TimestampValueType; BUILD_VERSION?: tools.PackageVersion };

export interface BuildInfoRepositoryPort {
  extract(): Promise<BuildInfoType>;
}
