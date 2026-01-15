import type * as tools from "@bgord/tools";
import type { CommitSha } from "./commit-sha.vo";

export type BuildInfoType = {
  timestamp: tools.Timestamp;
  version: tools.PackageVersion;
  sha: CommitSha;
  size: tools.Size;
};

export interface BuildInfoRepositoryStrategy {
  extract(): Promise<BuildInfoType>;
}
