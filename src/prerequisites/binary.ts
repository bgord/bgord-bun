import bun from "bun";
import { z } from "zod/v4";

import {
  AbstractPrerequisite,
  PrerequisiteLabelType,
  PrerequisiteStatusEnum,
  PrerequisiteStrategyEnum,
} from "../prerequisites";

const PrerequisiteBinaryValue = z
  .string()
  .min(1)
  .max(64)
  .refine((value) => !value.includes(" "));
type PrerequisiteBinaryValueType = z.infer<typeof PrerequisiteBinaryValue>;

type PrerequisiteBinaryConfigType = {
  binary: PrerequisiteBinaryValueType;
  label: PrerequisiteLabelType;
  enabled?: boolean;
};

export class PrerequisiteBinary extends AbstractPrerequisite<PrerequisiteBinaryConfigType> {
  readonly strategy = PrerequisiteStrategyEnum.binary;

  constructor(readonly config: PrerequisiteBinaryConfigType) {
    super(config);
  }

  async verify() {
    if (!this.enabled) return PrerequisiteStatusEnum.undetermined;

    try {
      const binary = PrerequisiteBinaryValue.parse(this.config.binary);

      const result = await bun.$`which ${binary}`;

      return result.exitCode === 0 ? this.pass() : this.reject();
    } catch (error) {
      return this.reject();
    }
  }
}
