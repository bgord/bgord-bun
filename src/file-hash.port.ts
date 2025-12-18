import type * as tools from "@bgord/tools";
import type { Hash } from "./hash.vo";

export type FileHashResult = {
  etag: Hash;
  size: tools.Size;
  lastModified: tools.Timestamp;
  mime: tools.Mime;
};

export interface FileHashPort {
  hash(path: tools.FilePathAbsolute | tools.FilePathRelative): Promise<FileHashResult>;
}
