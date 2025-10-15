import { Jobs, type MultipleJobsType } from "../jobs.service";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteJobs implements prereqs.Prerequisite {
  readonly kind = "jobs";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly jobs: MultipleJobsType;

  constructor(config: prereqs.PrerequisiteConfigType & { jobs: MultipleJobsType }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.jobs = config.jobs;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();
    if (Jobs.areAllRunning(this.jobs)) return prereqs.Verification.success();
    return prereqs.Verification.failure();
  }
}
