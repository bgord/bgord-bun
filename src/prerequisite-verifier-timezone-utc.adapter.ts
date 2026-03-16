import type * as tools from "@bgord/tools";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Config = { timezone: tools.TimezoneType };

export class PrerequisiteVerifierTimezoneUtcAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: Config) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    if (this.config.timezone === "UTC") return PrerequisiteVerification.success;
    return PrerequisiteVerification.failure(`Timezone: ${this.config.timezone}`);
  }

  get kind(): string {
    return "timezone-utc";
  }
}
