import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export class PrerequisiteVerifierExternalApiAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { request: (signal?: AbortSignal) => Promise<Response> }) {}

  async verify() {
    try {
      const response = await this.config.request();

      if (response.ok) return PrerequisiteVerification.success;
      return PrerequisiteVerification.failure({ message: `HTTP ${response.status}` });
    } catch (error) {
      return PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "external-api";
  }
}
