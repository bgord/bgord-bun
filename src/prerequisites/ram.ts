import os from "node:os";
import * as tools from "@bgord/tools";

import * as prereqs from "../prerequisites";

type PrerequisiteRAMConfigType = {
  minimum: tools.Size;
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteRAM extends prereqs.AbstractPrerequisite<PrerequisiteRAMConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.RAM;

  constructor(readonly config: PrerequisiteRAMConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    const freeRAM = new tools.Size({
      unit: tools.SizeUnit.b,
      value: os.freemem(),
    });

    if (freeRAM.isGreaterThan(this.config.minimum)) return this.pass();
    return this.reject();
  }
}
