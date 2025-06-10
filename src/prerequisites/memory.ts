import * as tools from "@bgord/tools";

import { MemoryConsumption } from "../memory-consumption.service";
import * as prereqs from "../prerequisites.service";

type PrerequisiteMemoryConfigType = {
  maximum: tools.Size;
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteMemory extends prereqs.AbstractPrerequisite<PrerequisiteMemoryConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.memory;

  constructor(readonly config: PrerequisiteMemoryConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    const memoryConsumption = MemoryConsumption.get();

    if (memoryConsumption.isGreaterThan(this.config.maximum)) {
      return this.reject();
    }
    return this.pass();
  }
}
