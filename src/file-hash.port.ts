import type * as tools from "@bgord/tools";
import type { FileEtagType } from "./file-etag.vo";

export type FileHashResult = {
  etag: FileEtagType;
  size: tools.Size;
  lastModified: tools.Timestamp;
  mime: tools.Mime;
};

export interface FileHashPort {
  hash(path: tools.FilePathAbsolute | tools.FilePathRelative): Promise<FileHashResult>;
}
