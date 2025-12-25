import bun from "bun";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type BunAuditOutput = { [packageName: string]: { severity: "low" | "moderate" | "high" | "critical" }[] };

export class PrerequisiteVerifierDependencyVulnerabilitiesAdapter implements PrerequisiteVerifierPort {
  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const command = await bun.$`bun audit --json`.quiet();

      if (command.exitCode !== 0) return PrerequisiteVerification.failure({ message: "Audit failure" });

      const audit = JSON.parse(command.stdout.toString()) as BunAuditOutput;

      const criticalVulnerabilitiesCount = Object.values(audit).filter((name) =>
        name.some((vulnerability) => vulnerability.severity === "critical"),
      ).length;

      const highVulnerabilitiesCount = Object.values(audit).filter((name) =>
        name.some((vulnerability) => vulnerability.severity === "high"),
      ).length;

      if (criticalVulnerabilitiesCount > 0 || highVulnerabilitiesCount > 0)
        return PrerequisiteVerification.failure({
          message: `Critical: ${criticalVulnerabilitiesCount} and high: ${highVulnerabilitiesCount}`,
        });

      return PrerequisiteVerification.success;
    } catch (error) {
      return PrerequisiteVerification.failure(error as Error);
    }
  }

  get kind() {
    return "dependency-vulnerabilities";
  }
}
