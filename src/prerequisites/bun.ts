import * as tools from "@bgord/tools";

import {
  AbstractPrerequisite,
  PrerequisiteLabelType,
  PrerequisiteStatusEnum,
  PrerequisiteStrategyEnum,
} from "../prerequisites";

type PrerequisiteBunConfigType = {
  version: tools.PackageVersion;
  label: PrerequisiteLabelType;
  enabled?: boolean;
  current: string;
};

export class PrerequisiteBun extends AbstractPrerequisite<PrerequisiteBunConfigType> {
  readonly strategy = PrerequisiteStrategyEnum.bun;

  constructor(readonly config: PrerequisiteBunConfigType) {
    super(config);
  }

  async verify(): Promise<PrerequisiteStatusEnum> {
    const current = tools.PackageVersion.fromString(this.config.current);

    if (current.isGreaterThanOrEqual(this.config.version)) {
      return this.pass();
    }
    return this.reject();
  }
}
