import dns from "dns/promises";
import * as tools from "@bgord/tools";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";
import { Timeout } from "./timeout.service";

export class PrerequisiteVerifierDnsAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { hostname: string; timeout?: tools.Duration }) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const timeout = this.config.timeout ?? tools.Duration.Seconds(1);

    try {
      await Timeout.run(dns.lookup(this.config.hostname), timeout);

      return prereqs.PrerequisiteVerification.success;
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "dns";
  }
}
