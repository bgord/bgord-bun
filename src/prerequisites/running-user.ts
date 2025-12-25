import os from "node:os";
import type { PrerequisiteVerifierPort } from "../prerequisite-verifier.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteRunningUser implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly username: string;

  constructor(config: prereqs.PrerequisiteConfigType & { username: string }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.username = config.username;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined;

    const current = os.userInfo().username;

    if (current === this.username) return prereqs.PrerequisiteVerification.success;
    return prereqs.PrerequisiteVerification.failure({ message: `Current user: ${current}` });
  }

  get kind() {
    return "running-user";
  }
}
