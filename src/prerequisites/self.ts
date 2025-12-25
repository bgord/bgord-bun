import * as prereqs from "../prerequisites.service";

export class PrerequisiteSelf implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  constructor(config: prereqs.PrerequisiteConfigType) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined();
    return prereqs.PrerequisiteVerification.success;
  }

  get kind() {
    return "self";
  }
}
