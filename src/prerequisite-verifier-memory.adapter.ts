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

    if (memoryConsumption.isSmallerThan(this.config.maximum)) return PrerequisiteVerification.success;
    return PrerequisiteVerification.failure(
      `Memory consumption: ${memoryConsumption.format(tools.Size.unit.MB)}`,
    );
  }

  get kind(): string {
    return "memory";
  }
}
