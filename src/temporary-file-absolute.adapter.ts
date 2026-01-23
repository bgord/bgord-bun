import * as tools from "@bgord/tools";
import type { FileCleanerPort } from "./file-cleaner.port";
import type { FileRenamerPort } from "./file-renamer.port";
import type { FileWriterPort } from "./file-writer.port";
import type { TemporaryFilePort } from "./temporary-file.port";

type Dependencies = {
  FileCleaner: FileCleanerPort;
  FileRenamer: FileRenamerPort;
  FileWriter: FileWriterPort;
};

export class TemporaryFileAbsoluteAdapter implements TemporaryFilePort {
  constructor(
    private readonly directory: tools.DirectoryPathAbsoluteType,
    private readonly deps: Dependencies,
  ) {}

  async write(filename: tools.Filename, content: File): Promise<tools.FilePathAbsolute> {
    const temporary = tools.FilePathAbsolute.fromPartsSafe(this.directory, filename.withSuffix("-part"));
    const final = tools.FilePathAbsolute.fromPartsSafe(this.directory, filename);

    await this.deps.FileWriter.write(temporary.get(), content);
    await this.deps.FileRenamer.rename(temporary, final);

    return final;
  }

  async cleanup(filename: tools.Filename): Promise<void> {
    await this.deps.FileCleaner.delete(tools.FilePathAbsolute.fromPartsSafe(this.directory, filename));
  }

  get root(): tools.DirectoryPathAbsoluteType {
    return this.directory;
  }
}
