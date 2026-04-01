import fs from "node:fs/promises";
import type { DirectoryEnsurerConfig, DirectoryEnsurerPort } from "./directory-ensurer.port";

export class DirectoryEnsurerAdapter implements DirectoryEnsurerPort {
  async ensure(config: DirectoryEnsurerConfig): Promise<void> {
    await fs.mkdir(config, { recursive: true });
  }
}
