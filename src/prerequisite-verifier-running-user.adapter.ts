import os from "node:os";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierRunningUserAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { username: string }) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const current = os.userInfo().username;

    if (current === this.config.username) return prereqs.PrerequisiteVerification.success;
    return prereqs.PrerequisiteVerification.failure({ message: `Current user: ${current}` });
  }

  get kind() {
    return "running-user";
  }
}
