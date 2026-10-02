import type * as tools from "@bgord/tools";
import type { AtomicFileWriterPort } from "./atomic-file-writer.port";
import type { FileCleanerPort } from "./file-cleaner.port";
import type { FileRenamerPort } from "./file-renamer.port";
import type { FileWriterContent, FileWriterPort } from "./file-writer.port";
import type { NonceProviderPort } from "./nonce-provider.port";

type Dependencies = {
  FileCleaner: FileCleanerPort;
  FileRenamer: FileRenamerPort;
  FileWriter: FileWriterPort;
  NonceProvider: NonceProviderPort;
};

export class AtomicFileWriterAdapter implements AtomicFileWriterPort {
  constructor(private readonly deps: Dependencies) {}

  async write(
    path: tools.FilePathRelative | tools.FilePathAbsolute,
    content: FileWriterContent,
  ): Promise<void> {
    const temporary = path.withFilename(
      path.getFilename().withSuffix(`-part-${this.deps.NonceProvider.generate()}`),
    );

    try {
      await this.deps.FileWriter.write(temporary.get(), content);
      await this.deps.FileRenamer.rename(temporary, path);
    } catch (error) {
      await this.deps.FileCleaner.delete(temporary).catch(() => {});
      throw error;
    }
  }
}
