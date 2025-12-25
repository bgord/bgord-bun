import type * as tools from "@bgord/tools";
import { z } from "zod/v4";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export const TimezoneUtc = z.literal("UTC");

export class PrerequisiteVerifierTimezoneUtcVerifier implements PrerequisiteVerifierPort {
  constructor(private readonly config: { timezone: tools.TimezoneType }) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const result = TimezoneUtc.safeParse(this.config.timezone);

    if (result.success) return prereqs.PrerequisiteVerification.success;
    return prereqs.PrerequisiteVerification.failure({ message: `Timezone: ${this.config.timezone}` });
  }

  get kind() {
    return "timezone-utc";
  }
}
