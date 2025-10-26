import type * as tools from "@bgord/tools";

export interface DiskSpaceCheckerPort {
  get(root: string): Promise<tools.Size>;
}
