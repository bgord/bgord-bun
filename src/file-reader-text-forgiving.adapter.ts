import type * as tools from "@bgord/tools";
import type { FileReaderTextPort } from "./file-reader-text.port";

export class FileReaderTextForgivingAdapter implements FileReaderTextPort {
  constructor(private readonly fallback: string = "") {}

  async read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<string> {
    try {
      return Bun.file(typeof path === "string" ? path : path.get()).text();
    } catch {
      return this.fallback;
    }
  }
}
