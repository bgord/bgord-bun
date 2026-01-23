import type * as tools from "@bgord/tools";

export interface FileReaderTextPort {
  read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<string>;
}
