import type * as tools from "@bgord/tools";
import type { FileReaderRawPort } from "./file-reader-raw.port";

export class FileReaderRawAdapter implements FileReaderRawPort {
  async read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<ArrayBuffer> {
    return Bun.file(typeof path === "string" ? path : path.get()).arrayBuffer();
  }
}
