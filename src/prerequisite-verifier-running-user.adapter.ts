import os from "node:os";
import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export class PrerequisiteVerifierRunningUserAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { username: string }) {}

  async verify() {
    const current = os.userInfo().username;

    if (current === this.config.username) return PrerequisiteVerification.success;
    return PrerequisiteVerification.failure({ message: `Current user: ${current}` });
  }

  get kind() {
    return "running-user";
  }
}
