import dns from "dns/promises";
import {
  PrerequisiteVerificationResult,
  PrerequisiteVerification,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierDnsAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { hostname: string }) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      await dns.lookup(this.config.hostname);

      return PrerequisiteVerification.success;
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return "dns";
  }
}
