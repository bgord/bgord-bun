import type * as tools from "@bgord/tools";
import type { FileReaderTextPort } from "./file-reader-text.port";

export class FileReaderTextNoopAdapter implements FileReaderTextPort {
  constructor(private readonly text: string = "") {}

  async read(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<string> {
    return this.text;
  }
}
