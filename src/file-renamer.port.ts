import type * as tools from "@bgord/tools";

export interface FileRenamerPort {
  rename(
    input: tools.FilePathRelative | tools.FilePathAbsolute | string,
    output: tools.FilePathRelative | tools.FilePathAbsolute | string,
  ): Promise<void>;
}
