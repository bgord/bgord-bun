import os from "node:os";
import * as tools from "@bgord/tools";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierRamAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { minimum: tools.Size }) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const freeRAM = tools.Size.fromBytes(os.freemem());

    if (freeRAM.isGreaterThan(this.config.minimum)) return prereqs.PrerequisiteVerification.success;
    return prereqs.PrerequisiteVerification.failure({
      message: `Free RAM: ${freeRAM.format(tools.Size.unit.MB)}`,
    });
  }

  get kind() {
    return "ram";
  }
}
