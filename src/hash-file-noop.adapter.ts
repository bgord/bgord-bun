import * as tools from "@bgord/tools";
import { Hash } from "./hash.vo";
import type { HashFilePort } from "./hash-file.port";

export class HashFileNoopAdapter implements HashFilePort {
  async hash(_path: tools.FilePathAbsolute | tools.FilePathRelative) {
    return {
      etag: Hash.fromString("0000000000000000000000000000000000000000000000000000000000000000"),
      size: tools.Size.fromBytes(10),
      lastModified: tools.Timestamp.fromNumber(1000),
      mime: tools.MIMES.text,
    };
  }
}
