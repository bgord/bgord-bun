import type { Prerequisite, PrerequisiteLabelType } from "./prerequisite.vo";
import {
  PrerequisiteVerificationOutcome,
  type PrerequisiteVerificationResult,
} from "./prerequisite-verifier.port";

export type ReadinessConfig = { prerequisites: ReadonlyArray<Prerequisite> };

export enum ReadinessStatusCode {
  Ready = 200,
  NotReady = 503,
}

type ReadinessResult = {
  code: ReadinessStatusCode;
  details: ReadonlyArray<{ label: PrerequisiteLabelType; outcome: PrerequisiteVerificationResult }>;
  headers: Record<string, string>;
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

    // Undetermined keeps traffic flowing here, unlike healthcheck where it degrades to 207
    const ok = details.every((detail) => detail.outcome.outcome !== PrerequisiteVerificationOutcome.failure);

    return {
      code: ok ? ReadinessStatusCode.Ready : ReadinessStatusCode.NotReady,
      details,
      headers: { "Cache-Control": "no-store" },
    };
  }
}
