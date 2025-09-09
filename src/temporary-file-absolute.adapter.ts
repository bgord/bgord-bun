import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import type { TemporaryFilePort } from "./temporary-file.port";

export class TemporaryFileAbsolute implements TemporaryFilePort {
  constructor(private readonly directory: tools.DirectoryPathAbsoluteType) {}

  async write(filename: tools.Filename, data: File) {
    const partPath = tools.FilePathAbsolute.fromPartsSafe(this.directory, filename.withSuffix("-part"));
    const finalPath = tools.FilePathAbsolute.fromPartsSafe(this.directory, filename);

    await Bun.write(partPath.get(), data);
    await fs.rename(partPath.get(), finalPath.get());

    return { path: finalPath };
  }

  async cleanup(filename: tools.Filename) {
    const path = tools.FilePathAbsolute.fromPartsSafe(this.directory, filename);

    try {
      await fs.unlink(path.get());
    } catch (error) {}
  }
}
