import os from "node:os";
import * as tools from "@bgord/tools";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierRamAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { minimum: tools.Size }) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    const freeRAM = tools.Size.fromBytes(os.freemem());

    if (freeRAM.isGreaterThan(this.config.minimum)) return PrerequisiteVerification.success;
    return PrerequisiteVerification.failure({ message: `Free RAM: ${freeRAM.format(tools.Size.unit.MB)}` });
  }

  get kind() {
    return "ram";
  }
}
