import * as tools from "@bgord/tools";
import type { FileHashPort } from "./file-hash.port";

export class FileHashSha256BunAdapter implements FileHashPort {
  async hash(path: tools.FilePathAbsolute | tools.FilePathRelative) {
    const file = Bun.file(path.get());
    const extension = path.getFilename().getExtension();

    const arrayBuffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const etag = Buffer.from(digest).toString("hex");

    return {
      etag,
      size: tools.Size.fromBytes(arrayBuffer.byteLength),
      lastModified: tools.Timestamp.parse(file.lastModified),
      mime: tools.Mime.fromExtension(extension),
    };
  }
}
