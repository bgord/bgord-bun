import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export class PrerequisiteVerifierSelfAdapter implements PrerequisiteVerifierPort {
  async verify() {
    return PrerequisiteVerification.success;
  }

  get kind() {
    return "self";
  }
}
