import * as tools from "@bgord/tools";
import type { BuildInfoRepositoryStrategy } from "./build-info-repository.strategy";
import { CommitSha } from "./commit-sha.vo";
import type { FileReaderJsonPort } from "./file-reader-json.port";

type Dependencies = { FileReaderJson: FileReaderJsonPort };

export const BUILD_INFO_REPOSITORY_FILENAME = tools.Filename.fromString("build-info.json");

export class BuildInfoRepositoryFileStrategy implements BuildInfoRepositoryStrategy {
  constructor(private readonly deps: Dependencies) {}

  async extract() {
    const file = await this.deps.FileReaderJson.read(BUILD_INFO_REPOSITORY_FILENAME.get());

    const version = tools.PackageVersion.fromString(file.version);
    const timestamp = tools.Timestamp.fromNumber(file.timestamp);
    const sha = CommitSha.fromString(file.sha);

    return { version, timestamp, sha };
  }
}
