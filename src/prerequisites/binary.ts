import type { BinaryType } from "../binary.vo";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteBinary implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly binary: BinaryType;

  constructor(config: prereqs.PrerequisiteConfigType & { binary: BinaryType }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
    this.binary = config.binary;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined();

      const result = Bun.which(this.binary);

      if (result) return prereqs.PrerequisiteVerification.success;
      return prereqs.PrerequisiteVerification.failure();
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "binary";
  }
}
