import type { Prerequisite, PrerequisiteLabelType } from "./prerequisite.vo";
import {
  PrerequisiteVerificationOutcome,
  type PrerequisiteVerificationResult,
} from "./prerequisite-verifier.port";

export type ReadinessConfig = {
  prerequisites: ReadonlyArray<Prerequisite>;
};

export type ReadinessResult = {
  ok: boolean;
  details: ReadonlyArray<{
    label: PrerequisiteLabelType;
    outcome: PrerequisiteVerificationResult;
  }>;
};

export class ReadinessHandler {
  constructor(private readonly config: ReadinessConfig) {}

  async check(): Promise<ReadinessResult> {
    const prerequisites = this.config.prerequisites
      .filter((prerequisite) => prerequisite.enabled)
      .filter((prerequisite) => prerequisite.kind !== "port");

    const details = await Promise.all(
      prerequisites.map(async (prerequisite) => ({
        label: prerequisite.label,
        outcome: await prerequisite.build().verify(),
      })),
    );

    const ok = details.every((detail) => detail.outcome.outcome !== PrerequisiteVerificationOutcome.failure);

    return { ok, details };
  }
}
