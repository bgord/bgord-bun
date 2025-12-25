import { Jobs, type MultipleJobsType } from "./jobs.service";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierJobsAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { Jobs: MultipleJobsType }) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (Jobs.areAllRunning(this.config.Jobs)) return prereqs.PrerequisiteVerification.success;
    return prereqs.PrerequisiteVerification.failure();
  }

  get kind() {
    return "jobs";
  }
}
