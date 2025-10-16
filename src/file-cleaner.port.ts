import type * as tools from "@bgord/tools";

export interface FileCleanerPort {
  delete(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<void>;
}
