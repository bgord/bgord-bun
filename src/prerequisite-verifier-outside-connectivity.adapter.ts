import * as tools from "@bgord/tools";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierOutsideConnectivityAdapter implements PrerequisiteVerifierPort {
  private static readonly URL = tools.UrlWithoutSlash.parse("https://google.com");

  constructor() {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      const response = await fetch(PrerequisiteVerifierOutsideConnectivityAdapter.URL, { method: "HEAD" });

      if (response.ok) return prereqs.PrerequisiteVerification.success;
      return prereqs.PrerequisiteVerification.failure({ message: `HTTP ${response.status}` });
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "outside-connectivity";
  }
}
