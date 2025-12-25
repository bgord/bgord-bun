import * as tools from "@bgord/tools";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierBunAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { version: tools.PackageVersion; current: string }) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      const current = tools.PackageVersion.fromString(this.config.current);

      if (current.isGreaterThanOrEqual(this.config.version)) return prereqs.PrerequisiteVerification.success;
      return prereqs.PrerequisiteVerification.failure({
        message: `Version: ${this.config.version.toString()}`,
      });
    } catch {
      return prereqs.PrerequisiteVerification.failure({
        message: `Invalid version passed: ${this.config.current}`,
      });
    }
  }

  get kind() {
    return "bun";
  }
}
