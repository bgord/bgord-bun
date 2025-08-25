import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import type { TemporaryFilePort } from "./temporary-file.port";

export class TemporaryFileAbsolute implements TemporaryFilePort {
  constructor(private readonly directory: tools.DirectoryPathAbsoluteType) {}

  async write(filename: tools.Filename, data: File) {
    const partPath = tools.AbsoluteFilePath.fromPartsSafe(this.directory, filename.withSuffix("-part"));
    const finalPath = tools.AbsoluteFilePath.fromPartsSafe(this.directory, filename);

    // POSIX atomic write
    await Bun.write(partPath.get(), data);
    await fs.rename(partPath.get(), finalPath.get());

    return { path: finalPath };
  }

  async cleanup(filename: tools.Filename) {
    const path = tools.AbsoluteFilePath.fromPartsSafe(this.directory, filename);

    try {
      await fs.unlink(path.get());
    } catch (error) {}
  }
}
