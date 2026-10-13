import * as tools from "@bgord/tools";
import type { FileInspectionPort } from "./file-inspection.port";
import type { HashContentStrategy } from "./hash-content.strategy";
import type { HashFilePort, HashFileResult } from "./hash-file.port";

type Dependencies = {
  HashContent: HashContentStrategy;
  FileInspection: FileInspectionPort;
  MimeRegistry: tools.MimeRegistry;
};

export class HashFileMetadataAdapter implements HashFilePort {
  constructor(private readonly deps: Dependencies) {}

  async hash(path: tools.FilePathAbsolute | tools.FilePathRelative): Promise<HashFileResult> {
    const extension = path.getFilename().getExtension();
    const mime = this.deps.MimeRegistry.fromExtension(extension);

    if (!mime) throw new Error(tools.MimeRegistryError.MimeNotFound);

    const size = await this.deps.FileInspection.size(path);
    const lastModified = await this.deps.FileInspection.lastModified(path);
    const etag = await this.deps.HashContent.hash(`${size.toBytes()}:${lastModified.ms}`);

    return { etag, size, lastModified, mime };
  }
}
