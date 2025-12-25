import * as tools from "@bgord/tools";
import { MemoryConsumption } from "./memory-consumption.service";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierMemoryAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { maximum: tools.Size }) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const memoryConsumption = MemoryConsumption.get();

    if (memoryConsumption.isGreaterThan(this.config.maximum)) {
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
