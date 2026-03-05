import os from "node:os";
import * as tools from "@bgord/tools";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Config = { minimum: tools.Size };

export class PrerequisiteVerifierRamAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: Config) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    const freeRAM = tools.Size.fromBytes(os.freemem());

    if (freeRAM.isGreaterThan(this.config.minimum)) return PrerequisiteVerification.success;
    return PrerequisiteVerification.failure(`Free RAM: ${freeRAM.format(tools.Size.unit.MB)}`);
  }

  get kind(): string {
    return "ram";
  }
}
