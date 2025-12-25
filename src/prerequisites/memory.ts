import * as tools from "@bgord/tools";
import { MemoryConsumption } from "../memory-consumption.service";
import type { PrerequisiteVerifierPort } from "../prerequisite-verifier.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteMemory implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  private readonly maximum: tools.Size;

  constructor(config: prereqs.PrerequisiteConfigType & { maximum: tools.Size }) {
    this.label = config.label;

    this.maximum = config.maximum;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
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
