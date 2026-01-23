import type * as tools from "@bgord/tools";
import type { FileReaderTextPort } from "./file-reader-text.port";

export class FileReaderTextAdapter implements FileReaderTextPort {
  async read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<string> {
    return Bun.file(typeof path === "string" ? path : path.get()).text();
  }
}
