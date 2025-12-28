import type * as tools from "@bgord/tools";
import type { FileReaderJsonPort } from "./file-reader-json.port";

export class FileReaderJsonNoopAdapter implements FileReaderJsonPort {
  constructor(private readonly json: Record<string, any>) {}

  async read(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<Record<string, any>> {
    return this.json;
  }
}
