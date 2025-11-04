import path from "node:path";
import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import type { DiskSpaceCheckerPort } from "../disk-space-checker.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteSpace implements prereqs.Prerequisite {
  readonly kind = "space";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly minimum: tools.Size;
  private readonly checker: DiskSpaceCheckerPort;

  constructor(
    config: prereqs.PrerequisiteConfigType & { minimum: tools.Size; checker: DiskSpaceCheckerPort },
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.minimum = config.minimum;
    this.checker = config.checker;
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    try {
      const root = path.sep;
      const freeDiskSpace = await this.checker.get(root);

      if (freeDiskSpace.isGreaterThan(this.minimum)) return prereqs.Verification.success();
      return prereqs.Verification.failure({
        message: `Free disk space: ${freeDiskSpace.format(tools.Size.unit.MB)}`,
      });
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }
  }
}
