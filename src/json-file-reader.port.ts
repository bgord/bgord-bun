import type * as tools from "@bgord/tools";

export interface JsonFileReaderPort {
  read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<Record<string, any>>;
}
