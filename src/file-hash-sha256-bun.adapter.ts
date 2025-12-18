import * as tools from "@bgord/tools";
import type { ContentHashPort } from "./content-hash.port";
import type { FileHashPort } from "./file-hash.port";

type Dependencies = { ContentHash: ContentHashPort };

export class FileHashSha256BunAdapter implements FileHashPort {
  constructor(private readonly deps: Dependencies) {}

  async hash(path: tools.FilePathAbsolute | tools.FilePathRelative) {
    const file = Bun.file(path.get());
    const extension = path.getFilename().getExtension();

    const arrayBuffer = await file.arrayBuffer();

    return {
      etag: await this.deps.ContentHash.hash(await file.text()),
      size: tools.Size.fromBytes(arrayBuffer.byteLength),
      lastModified: tools.Timestamp.fromNumber(file.lastModified),
      mime: tools.Mime.fromExtension(extension),
    };
  }
}
