import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import type { TemporaryFilePort } from "./temporary-file.port";

export class TemporaryFileAbsolute implements TemporaryFilePort {
  constructor(private readonly directory: tools.DirectoryPathAbsoluteType) {}

  async write(filename: tools.Filename, content: File) {
    const partial = tools.FilePathAbsolute.fromPartsSafe(this.directory, filename.withSuffix("-part"));
    const final = tools.FilePathAbsolute.fromPartsSafe(this.directory, filename);

    await Bun.write(partial.get(), content);
    await fs.rename(partial.get(), final.get());

    return { path: final };
  }

  async cleanup(filename: tools.Filename) {
    const path = tools.FilePathAbsolute.fromPartsSafe(this.directory, filename);

    try {
      await fs.unlink(path.get());
    } catch {}
  }
}
