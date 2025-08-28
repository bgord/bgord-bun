import * as tools from "@bgord/tools";
import type { FileHashPort } from "./file-hash.port";

export class FileHashNoopAdapter implements FileHashPort {
  async hash(_path: tools.FilePathAbsolute | tools.FilePathRelative) {
    return {
      etag: "noop",
      size: tools.Size.fromBytes(10),
      lastModified: tools.Timestamp.parse(1000),
      mime: new tools.Mime("text/plain"),
    };
  }
}
