import * as tools from "@bgord/tools";
import type { FileInspectionPort } from "./file-inspection.port";
import type { FileReaderRawPort } from "./file-reader-raw.port";
import type { HashBytesStrategy } from "./hash-bytes.strategy";
import type { HashFilePort, HashFileResult } from "./hash-file.port";

type Dependencies = {
  HashBytes: HashBytesStrategy;
  FileReaderRaw: FileReaderRawPort;
  FileInspection: FileInspectionPort;
  MimeRegistry: tools.MimeRegistry;
};

export class HashFileSha256Adapter implements HashFilePort {
  constructor(private readonly deps: Dependencies) {}

  async hash(path: tools.FilePathAbsolute | tools.FilePathRelative): Promise<HashFileResult> {
    const extension = path.getFilename().getExtension();
    const mime = this.deps.MimeRegistry.fromExtension(extension);

    if (!mime) throw new Error(tools.MimeRegistryError.MimeNotFound);

    const size = await this.deps.FileInspection.size(path);
    const lastModified = await this.deps.FileInspection.lastModified(path);
    const bytes = await this.deps.FileReaderRaw.read(path);

    return { etag: await this.deps.HashBytes.hash(new Uint8Array(bytes)), size, lastModified, mime };
  }
}
