import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierSelfAdapter implements PrerequisiteVerifierPort {
  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    return prereqs.PrerequisiteVerification.success;
  }

  get kind() {
    return "self";
  }
}
