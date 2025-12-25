import os from "node:os";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierRunningUserAdapter implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  private readonly username: string;

  constructor(config: prereqs.PrerequisiteConfigType & { username: string }) {
    this.label = config.label;

    this.username = config.username;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const current = os.userInfo().username;

    if (current === this.username) return prereqs.PrerequisiteVerification.success;
    return prereqs.PrerequisiteVerification.failure({ message: `Current user: ${current}` });
  }

  get kind() {
    return "running-user";
  }
}
