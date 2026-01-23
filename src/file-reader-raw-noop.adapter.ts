import type * as tools from "@bgord/tools";
import type { FileReaderRawPort } from "./file-reader-raw.port";

export class FileReaderRawNoopAdapter implements FileReaderRawPort {
  constructor(private readonly raw: ArrayBuffer) {}

  async read(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<ArrayBuffer> {
    return this.raw;
  }
}
