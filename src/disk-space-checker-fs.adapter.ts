/* cSpell:disable */
import fs from "node:fs/promises";
import * as tools from "@bgord/tools";
import type { DiskSpaceCheckerPort } from "./disk-space-checker.port";

export class DiskSpaceCheckerFsAdapter implements DiskSpaceCheckerPort {
  async get(root: tools.DirectoryPathAbsoluteType): Promise<tools.Size> {
    const stats = await fs.statfs(root);

    return tools.Size.fromBytes(stats.bavail * stats.bsize);
  }
}
