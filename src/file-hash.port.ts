import type * as tools from "@bgord/tools";

export type FileHashResult = {
  hex: string;
  bytes: tools.Size;
};

export interface FileHashPort {
  hash(path: tools.FilePathAbsolute | tools.FilePathRelative): Promise<FileHashResult>;
}
