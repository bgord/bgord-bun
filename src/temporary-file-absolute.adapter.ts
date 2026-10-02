import * as tools from "@bgord/tools";
import type { AtomicFileWriterPort } from "./atomic-file-writer.port";
import type { FileCleanerPort } from "./file-cleaner.port";
import type { TemporaryFilePort } from "./temporary-file.port";

type Dependencies = {
  AtomicFileWriter: AtomicFileWriterPort;
  FileCleaner: FileCleanerPort;
};

export class TemporaryFileAbsoluteAdapter implements TemporaryFilePort {
  constructor(
    private readonly directory: tools.DirectoryPathAbsoluteType,
    private readonly deps: Dependencies,
  ) {}

  async write(filename: tools.Filename, content: File): Promise<tools.FilePathAbsolute> {
    const final = tools.FilePathAbsolute.fromPartsSafe(this.directory, filename);

    await this.deps.AtomicFileWriter.write(final, content);

    return final;
  }

  async cleanup(filename: tools.Filename): Promise<void> {
    await this.deps.FileCleaner.delete(tools.FilePathAbsolute.fromPartsSafe(this.directory, filename));
  }

  get root(): tools.DirectoryPathAbsoluteType {
    return this.directory;
  }
}
