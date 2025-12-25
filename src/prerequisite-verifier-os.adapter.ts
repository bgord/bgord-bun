import os from "node:os";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierOsAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { accepted: string[] }) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const type = os.type();

    if (this.config.accepted.map((type) => type.toLowerCase()).includes(type.toLowerCase())) {
      return prereqs.PrerequisiteVerification.success;
    }

    return prereqs.PrerequisiteVerification.failure({
      message: `Unacceptable os: ${this.config.accepted.join(", ")}`,
    });
  }

  get kind() {
    return "os";
  }
}
