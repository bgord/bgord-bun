import type * as tools from "@bgord/tools";
import { z } from "zod/v4";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export const TimezoneUtc = z.literal("UTC");

export class PrerequisiteVerifierTimezoneUtcVerifier implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  private readonly timezone: tools.TimezoneType;

  constructor(config: prereqs.PrerequisiteConfigType & { timezone: tools.TimezoneType }) {
    this.label = config.label;

    this.timezone = config.timezone;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const result = TimezoneUtc.safeParse(this.timezone);

    if (result.success) return prereqs.PrerequisiteVerification.success;
    return prereqs.PrerequisiteVerification.failure({ message: `Timezone: ${this.timezone}` });
  }

  get kind() {
    return "timezone-utc";
  }
}
