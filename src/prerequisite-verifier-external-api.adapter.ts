import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export class PrerequisiteVerifierExternalApiAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { request: () => Promise<Response> }) {}

  async verify() {
    try {
      const response = await this.config.request();

      if (response.ok) return PrerequisiteVerification.success;
      return PrerequisiteVerification.failure(`HTTP ${response.status}`);
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind() {
    return "external-api";
  }
}
