import * as tools from "@bgord/tools";
import type { TemporaryFilePort } from "./temporary-file.port";

export class TemporaryFileNoopAdapter implements TemporaryFilePort {
  constructor(private readonly directory: tools.DirectoryPathAbsoluteType) {}

  async write(filename: tools.Filename): Promise<tools.FilePathAbsolute> {
    return tools.FilePathAbsolute.fromPartsSafe(this.directory, filename);
  }

  async cleanup(): Promise<void> {}

  get root(): tools.DirectoryPathAbsoluteType {
    return this.directory;
  }
}
