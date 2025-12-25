import { Jobs, type MultipleJobsType } from "../jobs.service";
import type { PrerequisiteVerifierPort } from "../prerequisite-verifier.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteJobs implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  private readonly Jobs: MultipleJobsType;

  constructor(config: prereqs.PrerequisiteConfigType & { Jobs: MultipleJobsType }) {
    this.label = config.label;

    this.Jobs = config.Jobs;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (Jobs.areAllRunning(this.Jobs)) return prereqs.PrerequisiteVerification.success;
    return prereqs.PrerequisiteVerification.failure();
  }

  get kind() {
    return "jobs";
  }
}
