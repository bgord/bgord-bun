import * as tools from "@bgord/tools";
import bun from "bun";

import {
  AbstractPrerequisite,
  PrerequisiteLabelType,
  PrerequisiteStatusEnum,
  PrerequisiteStrategyEnum,
} from "../prerequisites";

type PrerequisiteNodeConfigType = {
  version: tools.PackageVersion;
  label: PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteNode extends AbstractPrerequisite<PrerequisiteNodeConfigType> {
  readonly strategy = PrerequisiteStrategyEnum.node;

  constructor(readonly config: PrerequisiteNodeConfigType) {
    super(config);
  }

  async verify(): Promise<PrerequisiteStatusEnum> {
    if (!this.enabled) return PrerequisiteStatusEnum.undetermined;

    const { stdout } = await bun.$`node -v`;
    const version = stdout.toString().trim();
    const current = tools.PackageVersion.fromStringWithV(version);

    if (current.isGreaterThanOrEqual(this.config.version)) {
      return this.pass();
    }
    return this.reject();
  }
}
