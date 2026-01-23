import * as tools from "@bgord/tools";
import type { FileInspectionPort } from "./file-inspection.port";
import type { FileReaderTextPort } from "./file-reader-text.port";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { HashFilePort, HashFileResult } from "./hash-file.port";

type Dependencies = {
  HashContent: HashContentStrategy;
  FileReaderText: FileReaderTextPort;
  FileInspection: FileInspectionPort;
  MimeRegistry: tools.MimeRegistry;
};

export class HashFileSha256Adapter implements HashFilePort {
  constructor(private readonly deps: Dependencies) {}

  async hash(path: tools.FilePathAbsolute | tools.FilePathRelative): Promise<HashFileResult> {
    const extension = path.getFilename().getExtension();

    const mime = this.deps.MimeRegistry.fromExtension(extension);

    if (!mime) throw new Error(tools.MimeRegistryError.MimeNotFound);

    const file = Bun.file(path.get());

    const size = await this.deps.FileInspection.size(path);
    const text = await this.deps.FileReaderText.read(path);

    return {
      etag: await this.deps.HashContent.hash(text),
      size,
      lastModified: tools.Timestamp.fromNumber(file.lastModified),
      mime,
    };
  }
}
