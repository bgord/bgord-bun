import type { BinaryType } from "./binary.vo";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierBinaryAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { binary: BinaryType }) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const result = Bun.which(this.config.binary);

      if (result) return PrerequisiteVerification.success;
      return PrerequisiteVerification.failure();
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return "binary";
  }
}
