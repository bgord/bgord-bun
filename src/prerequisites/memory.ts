import * as tools from "@bgord/tools";
import { MemoryConsumption } from "../memory-consumption.service";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteMemory implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly maximum: tools.Size;

  constructor(config: prereqs.PrerequisiteConfigType & { maximum: tools.Size }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.maximum = config.maximum;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined;

    const memoryConsumption = MemoryConsumption.get();

    if (memoryConsumption.isGreaterThan(this.maximum)) {
      return prereqs.PrerequisiteVerification.failure({
        message: `Memory consumption: ${memoryConsumption.format(tools.Size.unit.MB)}`,
      });
    }
    return prereqs.PrerequisiteVerification.success;
  }

  get kind() {
    return "memory";
  }
}
