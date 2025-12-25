import path from "node:path";
import * as tools from "@bgord/tools";
import type { DiskSpaceCheckerPort } from "./disk-space-checker.port";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

type Dependencies = { DiskSpaceChecker: DiskSpaceCheckerPort };

export class PrerequisiteVerifierSpaceAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: { minimum: tools.Size },
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      const root = path.sep;
      const freeDiskSpace = await this.deps.DiskSpaceChecker.get(root);

      if (freeDiskSpace.isGreaterThan(this.config.minimum)) return prereqs.PrerequisiteVerification.success;
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
