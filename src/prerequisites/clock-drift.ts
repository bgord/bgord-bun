import type * as tools from "@bgord/tools";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteClockDrift implements prereqs.Prerequisite {
  readonly kind = "clock-drift";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  readonly skew: tools.Duration;

  constructor(config: prereqs.PrerequisiteConfigType & { skew: tools.Duration }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.skew = config.skew;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    return prereqs.Verification.success();
  }
}
