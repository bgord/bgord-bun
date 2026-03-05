import type * as tools from "@bgord/tools";
import * as z from "zod/v4";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export const TimezoneUtc = z.literal("UTC");

type Config = { timezone: tools.TimezoneType };

export class PrerequisiteVerifierTimezoneUtcAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: Config) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    const result = TimezoneUtc.safeParse(this.config.timezone);

    if (result.success) return PrerequisiteVerification.success;
    return PrerequisiteVerification.failure(`Timezone: ${this.config.timezone}`);
  }

  get kind(): string {
    return "timezone-utc";
  }
}
