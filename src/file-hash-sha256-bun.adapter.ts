import * as tools from "@bgord/tools";
import type { FileHashPort } from "./file-hash.port";
import { Hash } from "./hash.vo";

export class FileHashSha256BunAdapter implements FileHashPort {
  async hash(path: tools.FilePathAbsolute | tools.FilePathRelative) {
    const file = Bun.file(path.get());
    const extension = path.getFilename().getExtension();

    const arrayBuffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", arrayBuffer);

    return {
      etag: Hash.fromString(Buffer.from(digest).toString("hex")),
      size: tools.Size.fromBytes(arrayBuffer.byteLength),
      lastModified: tools.Timestamp.fromNumber(file.lastModified),
      mime: tools.Mime.fromExtension(extension),
    };
  }
}
