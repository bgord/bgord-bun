import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
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

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());
    if (Jobs.areAllRunning(this.jobs)) return prereqs.Verification.success(stopwatch.stop());
    return prereqs.Verification.failure();
  }
}
