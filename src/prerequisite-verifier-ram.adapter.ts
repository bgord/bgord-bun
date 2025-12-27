import os from "node:os";
import * as tools from "@bgord/tools";
import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export class PrerequisiteVerifierRamAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { minimum: tools.Size }) {}

  async verify() {
    const freeRAM = tools.Size.fromBytes(os.freemem());

    if (freeRAM.isGreaterThan(this.config.minimum)) return PrerequisiteVerification.success;

    const formatted = freeRAM.format(tools.Size.unit.MB);
    return PrerequisiteVerification.failure({ message: `Free RAM: ${formatted}` });
  }

  get kind() {
    return "ram";
  }
}
