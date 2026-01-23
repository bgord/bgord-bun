import type * as tools from "@bgord/tools";
import type { DirectoryEnsurerPort } from "./directory-ensurer.port";

export class DirectoryEnsurerNoopAdapter implements DirectoryEnsurerPort {
  async ensure(_path: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType): Promise<void> {}
}
