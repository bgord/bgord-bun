import * as tools from "@bgord/tools";
import { MemoryConsumption } from "./memory-consumption.service";
import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export class PrerequisiteVerifierMemoryAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { maximum: tools.Size }) {}

  async verify() {
    const memoryConsumption = MemoryConsumption.get();

    if (memoryConsumption.isGreaterThan(this.config.maximum)) {
      const formatted = memoryConsumption.format(tools.Size.unit.MB);

      return PrerequisiteVerification.failure({ message: `Memory consumption: ${formatted}` });
    }
    return PrerequisiteVerification.success;
  }

  get kind() {
    return "memory";
  }
}
