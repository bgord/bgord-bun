import * as tools from "@bgord/tools";
import { FileEtag } from "./file-etag.vo";
import type { FileHashPort } from "./file-hash.port";

export class FileHashNoopAdapter implements FileHashPort {
  async hash(_path: tools.FilePathAbsolute | tools.FilePathRelative) {
    return {
      etag: FileEtag.parse("0000000000000000000000000000000000000000000000000000000000000000"),
      size: tools.Size.fromBytes(10),
      lastModified: tools.Timestamp.fromNumber(1000),
      mime: tools.MIMES.text,
    };
  }
}
