import * as tools from "@bgord/tools";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierNodeAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { version: tools.PackageVersion; current: string }) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const current = tools.PackageVersion.fromVersionString(this.config.current);

      if (current.isGreaterThanOrEqual(this.config.version)) return PrerequisiteVerification.success;
      return PrerequisiteVerification.failure({ message: `Version: ${this.config.current}` });
    } catch {
      return PrerequisiteVerification.failure({ message: `Invalid version passed: ${this.config.current}` });
    }
  }

  get kind() {
    return "node";
  }
}
