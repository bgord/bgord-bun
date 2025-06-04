import os from "node:os";
import * as tools from "@bgord/tools";

import {
  AbstractPrerequisite,
  PrerequisiteLabelType,
  PrerequisiteStatusEnum,
  PrerequisiteStrategyEnum,
} from "../prerequisites";

type PrerequisiteRAMConfigType = {
  minimum: tools.Size;
  label: PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteRAM extends AbstractPrerequisite<PrerequisiteRAMConfigType> {
  readonly strategy = PrerequisiteStrategyEnum.RAM;

  constructor(readonly config: PrerequisiteRAMConfigType) {
    super(config);
  }

  async verify(): Promise<PrerequisiteStatusEnum> {
    if (!this.enabled) return PrerequisiteStatusEnum.undetermined;

    const freeRAM = new tools.Size({
      unit: tools.SizeUnit.b,
      value: os.freemem(),
    });

    if (freeRAM.isGreaterThan(this.config.minimum)) return this.pass();
    return this.reject();
  }
}
