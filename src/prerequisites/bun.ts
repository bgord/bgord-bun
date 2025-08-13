import * as tools from "@bgord/tools";
import * as prereqs from "../prerequisites.service";

type PrerequisiteBunConfigType = {
  version: tools.PackageVersion;
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
  current: string;
};

export class PrerequisiteBun extends prereqs.AbstractPrerequisite<PrerequisiteBunConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.bun;

  constructor(readonly config: PrerequisiteBunConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    const current = tools.PackageVersion.fromString(this.config.current);

    if (current.isGreaterThanOrEqual(this.config.version)) {
      return this.pass();
    }
    return this.reject();
  }
}
