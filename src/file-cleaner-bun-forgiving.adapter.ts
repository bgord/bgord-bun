import type * as tools from "@bgord/tools";
import type { FileCleanerPort } from "./file-cleaner.port";

export class FileCleanerBunForgivingAdapter implements FileCleanerPort {
  async delete(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<void> {
    try {
      await Bun.file(typeof path === "string" ? path : path.get()).delete();
    } catch {}
  }
}
