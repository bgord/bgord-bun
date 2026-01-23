import type * as tools from "@bgord/tools";

export interface FileCopierPort {
  copy(
    source: tools.FilePathRelative | tools.FilePathAbsolute | string,
    destination: tools.FilePathRelative | tools.FilePathAbsolute | string,
  ): Promise<void>;
}
