import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import type { FileCleanerPort } from "./file-cleaner.port";
import type { TemporaryFilePort } from "./temporary-file.port";

type Dependencies = { FileCleaner: FileCleanerPort };

export class TemporaryFileAbsolute implements TemporaryFilePort {
  constructor(
    private readonly directory: tools.DirectoryPathAbsoluteType,
    private readonly deps: Dependencies,
  ) {}

  async write(filename: tools.Filename, content: File) {
    const temporary = tools.FilePathAbsolute.fromPartsSafe(this.directory, filename.withSuffix("-part"));
    const final = tools.FilePathAbsolute.fromPartsSafe(this.directory, filename);

    await Bun.write(temporary.get(), content);
    await fs.rename(temporary.get(), final.get());

    return { path: final };
  }

  async cleanup(filename: tools.Filename) {
    await this.deps.FileCleaner.delete(tools.FilePathAbsolute.fromPartsSafe(this.directory, filename));
  }
}
