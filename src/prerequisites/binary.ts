import bun from "bun";
import { z } from "zod/v4";
import * as prereqs from "../prerequisites.service";

const PrerequisiteBinaryValue = z
  .string({ error: "binary_invalid" })
  .min(1, { error: "binary_invalid" })
  .max(64, { error: "binary_invalid" })
  .refine((value) => !value.includes(" "), { error: "binary_invalid" });

type PrerequisiteBinaryValueType = z.infer<typeof PrerequisiteBinaryValue>;

export class PrerequisiteBinary implements prereqs.Prerequisite {
  readonly kind = "binary";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly binary: PrerequisiteBinaryValueType;

  constructor(config: prereqs.PrerequisiteConfigType & { binary: PrerequisiteBinaryValueType }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
    this.binary = config.binary;
  }

  async verify(): Promise<prereqs.VerifyOutcome> {
    try {
      if (!this.enabled) return prereqs.Verification.undetermined();

      const binary = PrerequisiteBinaryValue.parse(this.binary);

      const result = await bun.$`which ${binary}`.quiet();

      return result.exitCode === 0
        ? prereqs.Verification.success()
        : prereqs.Verification.failure({ message: `Exit code ${result.exitCode}` });
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }
  }
}
