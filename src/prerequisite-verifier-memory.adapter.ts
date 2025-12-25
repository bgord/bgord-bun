import * as tools from "@bgord/tools";
import { MemoryConsumption } from "./memory-consumption.service";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierMemoryAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { maximum: tools.Size }) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    const memoryConsumption = MemoryConsumption.get();

    if (memoryConsumption.isGreaterThan(this.config.maximum)) {
      return PrerequisiteVerification.failure({
        message: `Memory consumption: ${memoryConsumption.format(tools.Size.unit.MB)}`,
      });
    }
    return PrerequisiteVerification.success;
  }

  get kind() {
    return "memory";
  }
}
