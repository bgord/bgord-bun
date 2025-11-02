import type * as tools from "@bgord/tools";

export type FileHashResult = {
  etag: string;
  size: tools.Size;
  lastModified: tools.Timestamp;
  mime: tools.Mime;
};

export interface FileHashPort {
  hash(path: tools.FilePathAbsolute | tools.FilePathRelative): Promise<FileHashResult>;
}
