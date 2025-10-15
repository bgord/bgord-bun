import type * as tools from "@bgord/tools";
import type { FileCleanerPort } from "./file-cleaner.port";

export class FileCleanerNoopAdapter implements FileCleanerPort {
  async delete(_path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<void> {}
}
