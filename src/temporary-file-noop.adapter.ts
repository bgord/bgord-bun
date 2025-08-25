import * as tools from "@bgord/tools";
import type { TemporaryFilePort } from "./temporary-file.port";

export class TemporaryFileNoop implements TemporaryFilePort {
  constructor(private readonly directory: tools.DirectoryPathAbsoluteType) {}

  async write(filename: tools.Filename) {
    const path = tools.AbsoluteFilePath.fromPartsSafe(this.directory, filename);

    return { path };
  }

  async cleanup() {}
}
