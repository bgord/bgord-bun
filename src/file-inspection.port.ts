import type * as tools from "@bgord/tools";

export interface FileInspectionPort {
  exists(path: tools.FilePathRelative | tools.FilePathAbsolute | string): Promise<boolean>;
}
