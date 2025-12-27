import dns from "dns/promises";
import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export class PrerequisiteVerifierDnsAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { hostname: string }) {}

  async verify() {
    try {
      await dns.lookup(this.config.hostname);

      return PrerequisiteVerification.success;
    } catch (error) {
      return PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "dns";
  }
}
