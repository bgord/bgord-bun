import os from "node:os";
import * as tools from "@bgord/tools";
import type { PrerequisiteVerifierPort } from "../prerequisite-verifier.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteRAM implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  private readonly minimum: tools.Size;

  constructor(config: prereqs.PrerequisiteConfigType & { minimum: tools.Size }) {
    this.label = config.label;

    this.minimum = config.minimum;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const freeRAM = tools.Size.fromBytes(os.freemem());

    if (freeRAM.isGreaterThan(this.minimum)) return prereqs.PrerequisiteVerification.success;
    return prereqs.PrerequisiteVerification.failure({
      message: `Free RAM: ${freeRAM.format(tools.Size.unit.MB)}`,
    });
  }

  get kind() {
    return "ram";
  }
}
