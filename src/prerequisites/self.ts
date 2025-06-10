import * as prereqs from "../prerequisites.service";

type PrerequisiteSelfConfigType = {
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteSelf extends prereqs.AbstractPrerequisite<PrerequisiteSelfConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.self;

  constructor(readonly config: PrerequisiteSelfConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;
    return this.pass();
  }
}
