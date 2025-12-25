import type { BinaryType } from "./binary.vo";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierBinaryAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { binary: BinaryType }) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      const result = Bun.which(this.config.binary);

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
