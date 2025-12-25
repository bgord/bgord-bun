import * as tools from "@bgord/tools";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteBun implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  private readonly version: tools.PackageVersion;
  private readonly current: string;

  constructor(config: prereqs.PrerequisiteConfigType & { version: tools.PackageVersion; current: string }) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
    this.version = config.version;
    this.current = config.current;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined;

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
