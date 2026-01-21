import path from "node:path";
import * as tools from "@bgord/tools";
import type { DiskSpaceCheckerPort } from "./disk-space-checker.port";
import {
  PrerequisiteVerificationResult,
  PrerequisiteVerification,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Dependencies = { DiskSpaceChecker: DiskSpaceCheckerPort };

export class PrerequisiteVerifierSpaceAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: { minimum: tools.Size },
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const root = path.sep;
      const freeDiskSpace = await this.deps.DiskSpaceChecker.get(root);

      if (freeDiskSpace.isGreaterThan(this.config.minimum)) return PrerequisiteVerification.success;
      return PrerequisiteVerification.failure(`Free disk space: ${freeDiskSpace.format(tools.Size.unit.MB)}`);
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return "space";
  }
}
