import { Jobs, type MultipleJobsType } from "../jobs.service";
import type { PrerequisiteVerifierPort } from "../prerequisite-verifier.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteJobs implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly Jobs: MultipleJobsType;

  constructor(config: prereqs.PrerequisiteConfigType & { Jobs: MultipleJobsType }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.Jobs = config.Jobs;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined;
    if (Jobs.areAllRunning(this.Jobs)) return prereqs.PrerequisiteVerification.success;
    return prereqs.PrerequisiteVerification.failure();
  }

  get kind() {
    return "jobs";
  }
}
