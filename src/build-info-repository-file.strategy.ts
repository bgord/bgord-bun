import * as tools from "@bgord/tools";
import type { BuildInfoRepositoryStrategy, BuildInfoType } from "./build-info-repository.strategy";
import { CommitSha } from "./commit-sha.vo";
import type { FileReaderJsonPort } from "./file-reader-json.port";

type Dependencies = { FileReaderJson: FileReaderJsonPort };

export const BUILD_INFO_REPOSITORY_FILE_PATH = tools.FilePathRelative.fromString("infra/build-info.json");

export class BuildInfoRepositoryFileStrategy implements BuildInfoRepositoryStrategy {
  constructor(private readonly deps: Dependencies) {}

  async extract(): Promise<BuildInfoType> {
    const file = await this.deps.FileReaderJson.read(BUILD_INFO_REPOSITORY_FILE_PATH.get());

    const version = tools.PackageVersion.fromString(file.version);
    const timestamp = tools.Timestamp.fromNumber(file.timestamp);
    const sha = CommitSha.fromString(file.sha);
    const size = tools.Size.fromBytes(file.size);

    return { version, timestamp, sha, size };
  }
}
