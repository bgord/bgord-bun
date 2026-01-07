import type * as tools from "@bgord/tools";

export type BuildInfoType = { timestamp: tools.Timestamp; version?: tools.PackageVersion };

export interface BuildInfoRepositoryStrategy {
  extract(): Promise<BuildInfoType>;
}
