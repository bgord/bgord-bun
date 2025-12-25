import * as tools from "@bgord/tools";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";

export class PrerequisiteVerifierBunAdapter implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  private readonly version: tools.PackageVersion;
  private readonly current: string;

  constructor(config: prereqs.PrerequisiteConfigType & { version: tools.PackageVersion; current: string }) {
    this.label = config.label;
    this.version = config.version;
    this.current = config.current;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    try {
      const current = tools.PackageVersion.fromString(this.current);

      if (current.isGreaterThanOrEqual(this.version)) return prereqs.PrerequisiteVerification.success;
      return prereqs.PrerequisiteVerification.failure({ message: `Version: ${this.version.toString()}` });
    } catch {
      return prereqs.PrerequisiteVerification.failure({ message: `Invalid version passed: ${this.current}` });
    }
  }

  get kind() {
    return "bun";
  }
}
