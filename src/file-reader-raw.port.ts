import type * as tools from "@bgord/tools";

export interface FileReaderRawPort {
  read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<ArrayBuffer>;
}
