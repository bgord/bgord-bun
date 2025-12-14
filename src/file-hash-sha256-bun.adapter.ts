import * as tools from "@bgord/tools";
import { FileEtag } from "./file-etag.vo";
import type { FileHashPort } from "./file-hash.port";

export class FileHashSha256BunAdapter implements FileHashPort {
  async hash(path: tools.FilePathAbsolute | tools.FilePathRelative) {
    const file = Bun.file(path.get());
    const extension = path.getFilename().getExtension();

    const arrayBuffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", arrayBuffer);

    return {
      etag: FileEtag.parse(Buffer.from(digest).toString("hex")),
      size: tools.Size.fromBytes(arrayBuffer.byteLength),
      lastModified: tools.Timestamp.fromNumber(file.lastModified),
      mime: tools.Mime.fromExtension(extension),
    };
  }
}
