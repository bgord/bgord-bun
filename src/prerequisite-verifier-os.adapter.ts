import os from "node:os";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierOsAdapter implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  private readonly accepted: string[];

  constructor(config: prereqs.PrerequisiteConfigType & { accepted: string[] }) {
    this.label = config.label;
    this.accepted = config.accepted;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const type = os.type();

    if (this.accepted.map((type) => type.toLowerCase()).includes(type.toLowerCase())) {
      return prereqs.PrerequisiteVerification.success;
    }
    return prereqs.PrerequisiteVerification.failure({
      message: `Unacceptable os: ${this.accepted.join(", ")}`,
    });
  }

  get kind() {
    return "os";
  }
}
