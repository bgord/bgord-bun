import type * as tools from "@bgord/tools";
import type { FileReaderJsonOutputType, FileReaderJsonPort } from "./file-reader-json.port";

export class FileReaderJsonNoopAdapter implements FileReaderJsonPort {
  constructor(private readonly json: Record<string, any>) {}

  async read(
    _path: tools.FilePathRelative | tools.FilePathAbsolute | string,
  ): Promise<FileReaderJsonOutputType> {
    return this.json;
  }
}
