import os from "node:os";
import {
  PrerequisiteVerificationResult,
  PrerequisiteVerification,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierRunningUserAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { username: string }) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    const current = os.userInfo().username;

    if (current === this.config.username) return PrerequisiteVerification.success;
    return PrerequisiteVerification.failure(`Current user: ${current}`);
  }

  get kind(): string {
    return "running-user";
  }
}
