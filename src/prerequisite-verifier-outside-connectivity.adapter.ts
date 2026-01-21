import * as tools from "@bgord/tools";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierOutsideConnectivityAdapter implements PrerequisiteVerifierPort {
  private static readonly URL = tools.UrlWithoutSlash.parse("https://google.com");

  constructor() {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const response = await fetch(PrerequisiteVerifierOutsideConnectivityAdapter.URL, { method: "HEAD" });

      if (response.ok) return PrerequisiteVerification.success;
      return PrerequisiteVerification.failure(`HTTP ${response.status}`);
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return "outside-connectivity";
  }
}
