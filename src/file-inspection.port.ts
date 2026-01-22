import type * as tools from "@bgord/tools";

export interface FileInspectionPort {
  exists(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean>;

  canRead(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean>;
  canWrite(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean>;
  canExecute(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean>;
}
