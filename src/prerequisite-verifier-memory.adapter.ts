import * as tools from "@bgord/tools";
import { MemoryConsumption } from "./memory-consumption.service";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Config = { maximum: tools.Size };

export class PrerequisiteVerifierMemoryAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: Config) {}

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
