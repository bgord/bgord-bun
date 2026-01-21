import type * as tools from "@bgord/tools";
import type { DiskSpaceCheckerPort } from "./disk-space-checker.port";

export class DiskSpaceCheckerNoopAdapter implements DiskSpaceCheckerPort {
  constructor(private readonly value: tools.Size) {}

  async get(_root: string): Promise<tools.Size> {
    return this.value;
  }
}
