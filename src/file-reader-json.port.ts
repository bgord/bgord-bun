import type * as tools from "@bgord/tools";

export type FileReaderJsonOutputType = Record<string, any>;

export interface FileReaderJsonPort {
  read(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<FileReaderJsonOutputType>;
}
