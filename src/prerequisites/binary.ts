import bun from "bun";
import * as tools from "@bgord/tools";
import type { BinaryType } from "../binary.vo";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteBinary implements prereqs.Prerequisite {
  readonly kind = "binary";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly binary: BinaryType;

  constructor(config: prereqs.PrerequisiteConfigType & { binary: BinaryType }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
    this.binary = config.binary;
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    try {
      if (!this.enabled) return prereqs.Verification.undetermined();

      const result = await bun.$`which ${this.binary}`.quiet();

      if (result.exitCode === 0) return prereqs.Verification.success(stopwatch.stop());
      return prereqs.Verification.failure({ message: `Exit code ${result.exitCode}` });
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }
  }
}
