import type { PrerequisiteVerifierPort } from "../prerequisite-verifier.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteSelf implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  constructor(config: prereqs.PrerequisiteConfigType) {
    this.label = config.label;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    return prereqs.PrerequisiteVerification.success;
  }

  get kind() {
    return "self";
  }
}
