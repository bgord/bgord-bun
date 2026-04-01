import type * as tools from "@bgord/tools";

export type DirectoryEnsurerConfig = tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType;

export interface DirectoryEnsurerPort {
  ensure(config: DirectoryEnsurerConfig): Promise<void>;
}
