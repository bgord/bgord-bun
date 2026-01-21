import bun from "bun";
import * as tools from "@bgord/tools";
import type { DiskSpaceCheckerPort } from "./disk-space-checker.port";

// Example command output:
// Filesystem     1024-blocks      Used Available Capacity  Mounted on
// /dev/disk3s1s1   239362496  10997540  43650948    21%    /

export class DiskSpaceCheckerBunAdapter implements DiskSpaceCheckerPort {
  async get(root: string): Promise<tools.Size> {
    const stdout = await bun.$`df -kP ${root}`.text();

    const line = stdout.trim().split(/\r?\n/)[1]; // Select the second line
    const free = Number(line?.trim().split(/\s+/)[3]); // Get the fourth block

    return tools.Size.fromKb(free);
  }
}
