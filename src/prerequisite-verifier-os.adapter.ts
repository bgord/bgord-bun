import os from "node:os";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierOsAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { accepted: string[] }) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    const type = os.type();

    if (this.config.accepted.map((type) => type.toLowerCase()).includes(type.toLowerCase())) {
      return PrerequisiteVerification.success;
    }

    return PrerequisiteVerification.failure({
      message: `Unacceptable os: ${this.config.accepted.join(", ")}`,
    });
  }

  get kind() {
    return "os";
  }
}
