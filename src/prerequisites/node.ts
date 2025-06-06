import * as tools from "@bgord/tools";
import bun from "bun";

import * as prereqs from "../prerequisites";

type PrerequisiteNodeConfigType = {
  version: tools.PackageVersion;
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteNode extends prereqs.AbstractPrerequisite<PrerequisiteNodeConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.node;

  constructor(readonly config: PrerequisiteNodeConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    const { stdout } = await bun.$`node -v`;
    const version = stdout.toString().trim();
    const current = tools.PackageVersion.fromStringWithV(version);

    if (current.isGreaterThanOrEqual(this.config.version)) {
      return this.pass();
    }
    return this.reject();
  }
}
