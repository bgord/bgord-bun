import * as tools from "@bgord/tools";
import type { FileHashPort } from "./file-hash.port";
import { Hash } from "./hash.vo";

export class FileHashNoopAdapter implements FileHashPort {
  async hash(_path: tools.FilePathAbsolute | tools.FilePathRelative) {
    return {
      etag: Hash.fromString("0000000000000000000000000000000000000000000000000000000000000000"),
      size: tools.Size.fromBytes(10),
      lastModified: tools.Timestamp.fromNumber(1000),
      mime: tools.MIMES.text,
    };
  }
}
