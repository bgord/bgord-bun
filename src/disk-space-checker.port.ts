import type * as tools from "@bgord/tools";

export interface DiskSpaceCheckerPort {
  get(root: tools.DirectoryPathAbsoluteType): Promise<tools.Size>;
}
