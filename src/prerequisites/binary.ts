import type { BinaryType } from "../binary.vo";
import type { PrerequisiteVerifierPort } from "../prerequisite-verifier.port";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteBinary implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  private readonly binary: BinaryType;

  constructor(config: prereqs.PrerequisiteConfigType & { binary: BinaryType }) {
    this.label = config.label;
    this.binary = config.binary;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
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
