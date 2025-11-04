import bun from "bun";
import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";

type BunAuditOutput = { [packageName: string]: { severity: "low" | "moderate" | "high" | "critical" }[] };

export class PrerequisiteDependencyVulnerabilities implements prereqs.Prerequisite {
  readonly kind = "dependency-vulnerabilities";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  constructor(config: prereqs.PrerequisiteConfigType) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    try {
      const command = await bun.$`bun audit --json`.quiet();

      if (command.exitCode !== 0) return prereqs.Verification.failure({ message: "Audit failure" });

      const audit = JSON.parse(command.stdout.toString()) as BunAuditOutput;

      const criticalVulnerabilitiesCount = Object.values(audit).filter((name) =>
        name.some((vulnerability) => vulnerability.severity === "critical"),
      ).length;

      const highVulnerabilitiesCount = Object.values(audit).filter((name) =>
        name.some((vulnerability) => vulnerability.severity === "high"),
      ).length;

      if (criticalVulnerabilitiesCount > 0 || highVulnerabilitiesCount > 0)
        return prereqs.Verification.failure({
          message: `Critical: ${criticalVulnerabilitiesCount} and high: ${highVulnerabilitiesCount}`,
        });

      return prereqs.Verification.success(stopwatch.stop());
    } catch (error) {
      return prereqs.Verification.failure(error as Error);
    }
  }
}
