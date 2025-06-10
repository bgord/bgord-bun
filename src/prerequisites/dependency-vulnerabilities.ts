import bun from "bun";

import {
  AbstractPrerequisite,
  PrerequisiteLabelType,
  PrerequisiteStatusEnum,
  PrerequisiteStrategyEnum,
} from "../prerequisites.service";

type PrerequisiteDependencyVulnerabilityConfigType = {
  label: PrerequisiteLabelType;
  enabled?: boolean;
};

type BunAuditOutput = {
  [packageName: string]: {
    severity: "low" | "moderate" | "high" | "critical";
  }[];
};

export class PrerequisiteDependencyVulnerabilities extends AbstractPrerequisite<PrerequisiteDependencyVulnerabilityConfigType> {
  readonly strategy = PrerequisiteStrategyEnum.dependencyVulnerabilities;

  constructor(readonly config: PrerequisiteDependencyVulnerabilityConfigType) {
    super(config);
  }

  async verify(): Promise<PrerequisiteStatusEnum> {
    if (!this.enabled) return PrerequisiteStatusEnum.undetermined;

    try {
      const result = await bun.$`bun audit --json`;

      if (result.exitCode !== 0) return this.reject();

      const audit = JSON.parse(result.stdout.toString()) as BunAuditOutput;

      const criticalVulnerabilitiesCount = Object.values(audit).filter((name) =>
        name.some((vulnerability) => vulnerability.severity === "critical"),
      ).length;

      const highVulnerabilitiesCount = Object.values(audit).filter((name) =>
        name.some((vulnerability) => vulnerability.severity === "high"),
      ).length;

      if (criticalVulnerabilitiesCount > 0 || highVulnerabilitiesCount > 0) {
        return this.reject();
      }
      return this.pass();
    } catch (error) {
      return this.reject();
    }
  }
}
