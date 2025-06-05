import * as tools from "@bgord/tools";
import { z } from "zod/v4";

import {
  AbstractPrerequisite,
  PrerequisiteLabelType,
  PrerequisiteStatusEnum,
  PrerequisiteStrategyEnum,
} from "../prerequisites";

type PrerequisiteTimezoneUtcConfigType = {
  timezone: tools.TimezoneType;
  label: PrerequisiteLabelType;
  enabled?: boolean;
};

export const TimezoneUtc = z.literal("UTC");

export class PrerequisiteTimezoneUTC extends AbstractPrerequisite<PrerequisiteTimezoneUtcConfigType> {
  readonly strategy = PrerequisiteStrategyEnum.timezoneUTC;

  constructor(readonly config: PrerequisiteTimezoneUtcConfigType) {
    super(config);
  }

  async verify(): Promise<PrerequisiteStatusEnum> {
    if (!this.enabled) return PrerequisiteStatusEnum.undetermined;

    try {
      TimezoneUtc.parse(this.config.timezone);
      return this.pass();
    } catch (error) {
      return this.reject();
    }
  }
}
