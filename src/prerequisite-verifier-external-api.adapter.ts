import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Config = { request: () => Promise<Response> };

export class PrerequisiteVerifierExternalApiAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: Config) {}

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
