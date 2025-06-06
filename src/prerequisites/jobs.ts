import { Jobs, MultipleJobsType } from "../jobs";
import * as prereqs from "../prerequisites";

type PrerequisiteJobsConfigType = {
  jobs: MultipleJobsType;
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteJobs extends prereqs.AbstractPrerequisite<PrerequisiteJobsConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.jobs;

  constructor(readonly config: PrerequisiteJobsConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    return Jobs.areAllRunning(this.config.jobs) ? this.pass() : this.reject();
  }
}
