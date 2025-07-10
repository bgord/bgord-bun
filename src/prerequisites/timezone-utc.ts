import * as tools from "@bgord/tools";
import { z } from "zod";

import * as prereqs from "../prerequisites.service";

type PrerequisiteTimezoneUtcConfigType = {
  timezone: tools.TimezoneType;
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export const TimezoneUtc = z.literal("UTC");

export class PrerequisiteTimezoneUTC extends prereqs.AbstractPrerequisite<PrerequisiteTimezoneUtcConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.timezoneUTC;

  constructor(readonly config: PrerequisiteTimezoneUtcConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    try {
      TimezoneUtc.parse(this.config.timezone);
      return this.pass();
    } catch (_error) {
      return this.reject();
    }
  }
}
