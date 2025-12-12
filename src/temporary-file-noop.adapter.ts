import * as tools from "@bgord/tools";
import type { TemporaryFilePort } from "./temporary-file.port";

export class TemporaryFileNoopAdapter implements TemporaryFilePort {
  constructor(private readonly directory: tools.DirectoryPathAbsoluteType) {}

  async write(filename: tools.Filename) {
    return { path: tools.FilePathAbsolute.fromPartsSafe(this.directory, filename) };
  }

  async cleanup() {}

  get root() {
    return this.directory;
  }
}
