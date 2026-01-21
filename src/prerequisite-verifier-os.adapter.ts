import os from "node:os";
import {
  PrerequisiteVerificationResult,
  PrerequisiteVerification,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierOsAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { accepted: string[] }) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    const type = os.type().toLowerCase();

    if (this.config.accepted.map((given) => given.toLowerCase()).includes(type)) {
      return PrerequisiteVerification.success;
    }
    return PrerequisiteVerification.failure(`Unacceptable os: ${this.config.accepted.join(", ")}`);
  }

  get kind(): string {
    return "os";
  }
}
