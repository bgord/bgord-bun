import dns from "dns/promises";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierDnsAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { hostname: string }) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      await dns.lookup(this.config.hostname);

      return prereqs.PrerequisiteVerification.success;
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "dns";
  }
}
