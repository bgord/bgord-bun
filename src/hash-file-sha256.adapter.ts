import * as tools from "@bgord/tools";
import type { FileReaderTextPort } from "./file-reader-text.port";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { HashFilePort, HashFileResult } from "./hash-file.port";

type Dependencies = {
  HashContent: HashContentStrategy;
  FileReaderText: FileReaderTextPort;
  MimeRegistry: tools.MimeRegistry;
};

export class HashFileSha256Adapter implements HashFilePort {
  constructor(private readonly deps: Dependencies) {}

  async hash(path: tools.FilePathAbsolute | tools.FilePathRelative): Promise<HashFileResult> {
    const extension = path.getFilename().getExtension();

    const mime = this.deps.MimeRegistry.fromExtension(extension);

    if (!mime) throw new Error(tools.MimeRegistryError.MimeNotFound);

    const file = Bun.file(path.get());
    const arrayBuffer = await file.arrayBuffer();

    const text = await this.deps.FileReaderText.read(path);

    return {
      etag: await this.deps.HashContent.hash(text),
      size: tools.Size.fromBytes(arrayBuffer.byteLength),
      lastModified: tools.Timestamp.fromNumber(file.lastModified),
      mime,
    };
  }
}
