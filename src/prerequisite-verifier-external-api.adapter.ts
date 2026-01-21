import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierExternalApiAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { request: () => Promise<Response> }) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const response = await this.config.request();

      if (response.ok) return PrerequisiteVerification.success;
      return PrerequisiteVerification.failure(`HTTP ${response.status}`);
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return "external-api";
  }
}
