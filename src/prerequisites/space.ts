import path from "node:path";
import * as tools from "@bgord/tools";
import checkDiskSpace from "check-disk-space";

import {
  AbstractPrerequisite,
  PrerequisiteLabelType,
  PrerequisiteStatusEnum,
  PrerequisiteStrategyEnum,
} from "../prerequisites";

export type PrerequisiteSpaceConfigType = {
  minimum: tools.Size;
  label: PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteSpace extends AbstractPrerequisite<PrerequisiteSpaceConfigType> {
  readonly strategy = PrerequisiteStrategyEnum.space;

  constructor(readonly config: PrerequisiteSpaceConfigType) {
    super(config);
  }

  async verify(): Promise<PrerequisiteStatusEnum> {
    if (!this.enabled) return PrerequisiteStatusEnum.undetermined;

    const fsRoot = path.sep;
    const bytes = await checkDiskSpace(fsRoot);

    const freeDiskSpace = new tools.Size({
      unit: tools.SizeUnit.b,
      value: bytes.free,
    });

    if (freeDiskSpace.isGreaterThan(this.config.minimum)) return this.pass();
    return this.reject();
  }
}
