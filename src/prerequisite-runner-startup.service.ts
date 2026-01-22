import type { ClockPort } from "../src/clock.port";
import type { LoggerPort } from "../src/logger.port";
import type { Prerequisite } from "./prerequisite.vo";
import { PrerequisiteVerificationOutcome } from "./prerequisite-verifier.port";

export const PrerequisitesError = { Failure: "prerequisites.failure" };

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

/** @public */
export class PrerequisiteRunnerStartup {
  private readonly base = { component: "infra", operation: "startup" };

  constructor(private readonly deps: Dependencies) {}

  async check(prerequisites: Prerequisite[]) {
    const result = await Promise.all(
      prerequisites
        .filter((prerequisite) => prerequisite.enabled)
        .map(async (prerequisite) => ({
          prerequisite,
          outcome: await prerequisite.build().verify(),
        })),
    );

    const failures = result.filter(
      (result) => result.outcome.outcome === PrerequisiteVerificationOutcome.failure,
    );

    if (failures.length === 0) return this.deps.Logger.info({ message: "Prerequisites ok", ...this.base });

    for (const failure of failures) {
      this.deps.Logger.error({
        message: "Prerequisite failed",
        metadata: { label: failure.prerequisite.label, kind: failure.prerequisite.kind },
        error:
          "error" in failure.outcome && failure.outcome.error
            ? failure.outcome.error
            : new Error("Unknown error"),
        ...this.base,
      });
    }

    throw new Error(PrerequisitesError.Failure);
  }
}
