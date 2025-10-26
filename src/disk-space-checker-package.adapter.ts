import * as tools from "@bgord/tools";
import checkDiskSpace from "check-disk-space";
import type { DiskSpaceCheckerPort } from "./disk-space-checker.port";

export class DiskSpaceCheckerPackageAdapter implements DiskSpaceCheckerPort {
  async get(root: string) {
    const result = await checkDiskSpace(root);

    return tools.Size.fromBytes(result.free);
  }
}
