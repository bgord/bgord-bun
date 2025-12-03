import path from "node:path";
import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import type { DiskSpaceCheckerPort } from "../disk-space-checker.port";
import { DiskSpaceCheckerBunAdapter } from "../disk-space-checker-bun.adapter";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteSpace implements prereqs.Prerequisite {
  readonly kind = "space";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly minimum: tools.Size;
  private readonly DiskSpaceChecker: DiskSpaceCheckerPort;

  constructor(
    config: prereqs.PrerequisiteConfigType & { minimum: tools.Size; DiskSpaceChecker?: DiskSpaceCheckerPort },
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.minimum = config.minimum;
    this.DiskSpaceChecker = config.DiskSpaceChecker ?? new DiskSpaceCheckerBunAdapter();
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    try {
      const root = path.sep;
      const freeDiskSpace = await this.DiskSpaceChecker.get(root);

      if (freeDiskSpace.isGreaterThan(this.minimum)) return prereqs.Verification.success(stopwatch.stop());
      return prereqs.Verification.failure(stopwatch.stop(), {
        message: `Free disk space: ${freeDiskSpace.format(tools.Size.unit.MB)}`,
      });
    } catch (error) {
      return prereqs.Verification.failure(stopwatch.stop(), error as Error);
    }
  }
}
