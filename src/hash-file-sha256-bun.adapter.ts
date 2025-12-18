import * as tools from "@bgord/tools";
import type { HashContentPort } from "./hash-content.port";
import type { HashFilePort } from "./hash-file.port";

type Dependencies = { HashContent: HashContentPort };

export class HashFileSha256BunAdapter implements HashFilePort {
  constructor(private readonly deps: Dependencies) {}

  async hash(path: tools.FilePathAbsolute | tools.FilePathRelative) {
    const file = Bun.file(path.get());
    const extension = path.getFilename().getExtension();

    const arrayBuffer = await file.arrayBuffer();

    return {
      etag: await this.deps.HashContent.hash(await file.text()),
      size: tools.Size.fromBytes(arrayBuffer.byteLength),
      lastModified: tools.Timestamp.fromNumber(file.lastModified),
      mime: tools.Mime.fromExtension(extension),
    };
  }
}
