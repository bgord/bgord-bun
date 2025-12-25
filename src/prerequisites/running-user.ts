import os from "node:os";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteRunningUser implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly username: string;

  constructor(config: prereqs.PrerequisiteConfigType & { username: string }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.username = config.username;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    const current = os.userInfo().username;

    if (current === this.username) return prereqs.Verification.success();
    return prereqs.Verification.failure({ message: `Current user: ${current}` });
  }

  get kind() {
    return "running-user";
  }
}
