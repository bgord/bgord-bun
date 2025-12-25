import type * as tools from "@bgord/tools";
import { z } from "zod/v4";
import type { PrerequisiteVerifierPort } from "../prerequisite-verifier.port";
import * as prereqs from "../prerequisites.service";

export const TimezoneUtc = z.literal("UTC");

export class PrerequisiteTimezoneUTC implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly timezone: tools.TimezoneType;

  constructor(config: prereqs.PrerequisiteConfigType & { timezone: tools.TimezoneType }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.timezone = config.timezone;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined;

    const result = TimezoneUtc.safeParse(this.timezone);

    if (result.success) return prereqs.PrerequisiteVerification.success;
    return prereqs.PrerequisiteVerification.failure({ message: `Timezone: ${this.timezone}` });
  }

  get kind() {
    return "timezone-utc";
  }
}
