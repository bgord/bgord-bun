import type * as tools from "@bgord/tools";

export interface DirectoryEnsurerPort {
  ensure(path: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType): Promise<void>;
}
