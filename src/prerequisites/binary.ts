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
      if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

      const result = Bun.which(this.binary);

      if (result) return prereqs.Verification.success(stopwatch.stop());
      return prereqs.Verification.failure(stopwatch.stop());
    } catch (error) {
      return prereqs.Verification.failure(stopwatch.stop(), error as Error);
    }
  }
}
