import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierExternalApiAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { request: (signal?: AbortSignal) => Promise<Response> }) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      const response = await this.config.request();

      if (response.ok) return prereqs.PrerequisiteVerification.success;
      return prereqs.PrerequisiteVerification.failure({ message: `HTTP ${response.status}` });
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "external-api";
  }
}
