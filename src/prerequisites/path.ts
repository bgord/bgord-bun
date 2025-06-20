import { constants } from "node:fs";
import fsp from "node:fs/promises";

import * as prereqs from "../prerequisites.service";

type PrerequisitePathConfigType = {
  path: string;
  access?: { write?: boolean; execute?: boolean };
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisitePath extends prereqs.AbstractPrerequisite<PrerequisitePathConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.path;

  constructor(readonly config: PrerequisitePathConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    const write = this.config.access?.write ?? false;
    const execute = this.config.access?.execute ?? false;

    const flags = constants.R_OK | (write ? constants.W_OK : 0) | (execute ? constants.X_OK : 0);

    try {
      await fsp.access(this.config.path, flags);

      return this.pass();
    } catch (_error) {
      return this.reject();
    }
  }
}
