import { Jobs, type MultipleJobsType } from "../jobs.service";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteJobs implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly Jobs: MultipleJobsType;

  constructor(config: prereqs.PrerequisiteConfigType & { Jobs: MultipleJobsType }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.Jobs = config.Jobs;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (!this.enabled) return prereqs.Verification.undetermined();
    if (Jobs.areAllRunning(this.Jobs)) return prereqs.Verification.success();
    return prereqs.Verification.failure();
  }

  get kind() {
    return "jobs";
  }
}
