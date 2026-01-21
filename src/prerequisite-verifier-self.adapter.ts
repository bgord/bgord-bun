import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierSelfAdapter implements PrerequisiteVerifierPort {
  async verify(): Promise<PrerequisiteVerificationResult> {
    return PrerequisiteVerification.success;
  }

  get kind(): string {
    return "self";
  }
}
