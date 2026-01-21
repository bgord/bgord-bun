import * as tools from "@bgord/tools";
import {
  type PrerequisiteVerificationResult,
  PrerequisiteVerification,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

export class PrerequisiteVerifierBunAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { version: tools.PackageVersion; current: string }) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const current = tools.PackageVersion.fromString(this.config.current);

      if (current.isGreaterThanOrEqual(this.config.version)) return PrerequisiteVerification.success;
      return PrerequisiteVerification.failure(`Version: ${this.config.version.toString()}`);
    } catch {
      return PrerequisiteVerification.failure(`Invalid version passed: ${this.config.current}`);
    }
  }

  get kind(): string {
    return "bun";
  }
}
