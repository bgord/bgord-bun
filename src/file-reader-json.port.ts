import type * as tools from "@bgord/tools";

export interface FileReaderJsonPort {
  read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<Record<string, any>>;
}
