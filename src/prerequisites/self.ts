import * as prereqs from "../prerequisites.service";

export class PrerequisiteSelf implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  constructor(config: prereqs.PrerequisiteConfigType) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();
    return prereqs.Verification.success();
  }

  get kind() {
    return "self";
  }
}
