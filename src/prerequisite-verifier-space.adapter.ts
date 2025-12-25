import path from "node:path";
import * as tools from "@bgord/tools";
import type { DiskSpaceCheckerPort } from "./disk-space-checker.port";
import { DiskSpaceCheckerBunAdapter } from "./disk-space-checker-bun.adapter";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

type Dependencies = { DiskSpaceChecker?: DiskSpaceCheckerPort };

export class PrerequisiteVerifierSpaceAdapter implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  private readonly minimum: tools.Size;

  constructor(
    config: prereqs.PrerequisiteConfigType & { minimum: tools.Size },
    private readonly deps?: Dependencies,
  ) {
    this.label = config.label;

    this.minimum = config.minimum;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const DiskSpaceChecker = this.deps?.DiskSpaceChecker ?? new DiskSpaceCheckerBunAdapter();

    try {
      const root = path.sep;
      const freeDiskSpace = await DiskSpaceChecker.get(root);

      if (freeDiskSpace.isGreaterThan(this.minimum)) return prereqs.PrerequisiteVerification.success;
      return prereqs.PrerequisiteVerification.failure({
        message: `Free disk space: ${freeDiskSpace.format(tools.Size.unit.MB)}`,
      });
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "space";
  }
}
