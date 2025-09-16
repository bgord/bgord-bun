import os from "node:os";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteRunningUser implements prereqs.Prerequisite {
  readonly kind = "running-user";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly user: string;

  constructor(config: prereqs.PrerequisiteConfigType & { user: string }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
    this.user = config.user;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    const current = os.userInfo().username;

    if (current === this.user) return prereqs.Verification.success();
    return prereqs.Verification.failure({ message: `Current user: ${this.user}` });
  }
}
