import * as tools from "@bgord/tools";
import type { FileHashPort, FileHashResult } from "./file-hash.port";

export class FileHashBunWebCryptoAdapter implements FileHashPort {
  async hash(path: tools.FilePathAbsolute | tools.FilePathRelative): Promise<FileHashResult> {
    const file = Bun.file(path.get());

    const arrayBuffer = await file.arrayBuffer();
    const digest = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hex = Buffer.from(digest).toString("hex");

    return { hex, bytes: tools.Size.fromBytes(arrayBuffer.byteLength) };
  }
}
