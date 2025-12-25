import bun from "bun";
import * as prereqs from "../prerequisites.service";

type BunAuditOutput = { [packageName: string]: { severity: "low" | "moderate" | "high" | "critical" }[] };

export class PrerequisiteDependencyVulnerabilities implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  constructor(config: prereqs.PrerequisiteConfigType) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    if (!this.enabled) return prereqs.PrerequisiteVerification.undetermined;

    try {
      const command = await bun.$`bun audit --json`.quiet();

      if (command.exitCode !== 0)
        return prereqs.PrerequisiteVerification.failure({ message: "Audit failure" });

      const audit = JSON.parse(command.stdout.toString()) as BunAuditOutput;

      const criticalVulnerabilitiesCount = Object.values(audit).filter((name) =>
        name.some((vulnerability) => vulnerability.severity === "critical"),
      ).length;

      const highVulnerabilitiesCount = Object.values(audit).filter((name) =>
        name.some((vulnerability) => vulnerability.severity === "high"),
      ).length;

      if (criticalVulnerabilitiesCount > 0 || highVulnerabilitiesCount > 0)
        return prereqs.PrerequisiteVerification.failure({
          message: `Critical: ${criticalVulnerabilitiesCount} and high: ${highVulnerabilitiesCount}`,
        });

      return prereqs.PrerequisiteVerification.success;
    } catch (error) {
      return prereqs.PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "dependency-vulnerabilities";
  }
}
