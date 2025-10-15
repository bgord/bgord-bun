import type * as tools from "@bgord/tools";
import type { JsonFileReaderPort } from "./file-reader-json.port";

export class JsonFileReaderNoopAdapter implements JsonFileReaderPort {
  constructor(private readonly json: Record<string, any>) {}

  async read(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<Record<string, any>> {
    return this.json;
  }
}
