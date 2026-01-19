import type * as tools from "@bgord/tools";
import * as z from "zod/v4";
import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

export const TimezoneUtc = z.literal("UTC");

export class PrerequisiteVerifierTimezoneUtcAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { timezone: tools.TimezoneType }) {}

  async verify() {
    const result = TimezoneUtc.safeParse(this.config.timezone);

    if (result.success) return PrerequisiteVerification.success;
    return PrerequisiteVerification.failure(`Timezone: ${this.config.timezone}`);
  }

  get kind() {
    return "timezone-utc";
  }
}
