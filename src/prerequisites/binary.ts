import bun from "bun";
import { z } from "zod/v4";

import * as prereqs from "../prerequisites.service";

const PrerequisiteBinaryValue = z
  .string()
  .min(1)
  .max(64)
  .refine((value) => !value.includes(" "));

type PrerequisiteBinaryValueType = z.infer<typeof PrerequisiteBinaryValue>;

type PrerequisiteBinaryConfigType = {
  binary: PrerequisiteBinaryValueType;
  label: prereqs.PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteBinary extends prereqs.AbstractPrerequisite<PrerequisiteBinaryConfigType> {
  readonly strategy = prereqs.PrerequisiteStrategyEnum.binary;

  constructor(readonly config: PrerequisiteBinaryConfigType) {
    super(config);
  }

  async verify() {
    if (!this.enabled) return prereqs.PrerequisiteStatusEnum.undetermined;

    try {
      const binary = PrerequisiteBinaryValue.parse(this.config.binary);

      const result = await bun.$`which ${binary}`.quiet();

      return result.exitCode === 0 ? this.pass() : this.reject();
    } catch (_error) {
      return this.reject();
    }
  }
}
