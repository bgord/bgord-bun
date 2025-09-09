import * as tools from "@bgord/tools";
import * as prereqs from "../prerequisites.service";

export class PrerequisiteNode implements prereqs.Prerequisite {
  readonly kind = "node";
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

  async verify(): Promise<prereqs.VerifyOutcome> {
    if (!this.enabled) return prereqs.Verification.undetermined();

    try {
      const current = tools.PackageVersion.fromStringWithV(this.current);

      if (current.isGreaterThanOrEqual(this.version)) return prereqs.Verification.success();
      return prereqs.Verification.failure({ message: `Version: ${this.version.major}` });
    } catch (error) {
      return prereqs.Verification.failure({ message: `Invalid version passed: ${this.current}` });
    }
  }
}
