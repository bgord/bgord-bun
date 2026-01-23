import fs from "node:fs/promises";
import type * as tools from "@bgord/tools";
import type { DirectoryEnsurerPort } from "./directory-ensurer.port";

export class DirectoryEnsurerAdapter implements DirectoryEnsurerPort {
  async ensure(path: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType): Promise<void> {
    await fs.mkdir(path, { recursive: true });
  }
}
