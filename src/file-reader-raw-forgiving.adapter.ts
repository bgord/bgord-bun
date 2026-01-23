import type * as tools from "@bgord/tools";
import type { FileReaderRawPort } from "./file-reader-raw.port";

export class FileReaderRawForgivingAdapter implements FileReaderRawPort {
  constructor(private readonly fallback: ArrayBuffer) {}

  async read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<ArrayBuffer> {
    try {
      return Bun.file(typeof path === "string" ? path : path.get()).arrayBuffer();
    } catch {
      return this.fallback;
    }
  }
}
