import type * as tools from "@bgord/tools";
import { z } from "zod/v4";
import * as prereqs from "../prerequisites.service";

export const TimezoneUtc = z.literal("UTC");

export class PrerequisiteTimezoneUTC implements prereqs.Prerequisite {
  readonly kind = "timezone-utc";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly timezone: tools.TimezoneType;

  constructor(config: prereqs.PrerequisiteConfigType & { timezone: tools.TimezoneType }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
    this.timezone = config.timezone;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    const result = TimezoneUtc.safeParse(this.timezone);

    if (result.success) return prereqs.Verification.success();
    return prereqs.Verification.failure({ message: `Timezone: ${this.timezone}` });
  }
}
