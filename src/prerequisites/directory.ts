import { constants } from "node:fs";
import fsp from "node:fs/promises";
import type * as tools from "@bgord/tools";
import * as prereqs from "../prerequisites.service";

type PrerequisiteDirectoryConfigType = {
  directory: tools.DirectoryPathAbsoluteType | tools.DirectoryPathRelativeType;
  access?: { write?: boolean; execute?: boolean };
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteDirectory extends prereqs.AbstractPrerequisite<PrerequisiteDirectoryConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.path;

  constructor(readonly config: PrerequisiteDirectoryConfigType) {
    super(config);
  }

  async verify(): Promise<prereqs.PrerequisiteStatusEnum> {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    const write = this.config.access?.write ?? false;
    const execute = this.config.access?.execute ?? false;

    const flags = constants.R_OK | (write ? constants.W_OK : 0) | (execute ? constants.X_OK : 0);

    try {
      await fsp.access(this.config.directory, flags);

      return this.pass();
    } catch (_error) {
      return this.reject();
    }
  }
}
