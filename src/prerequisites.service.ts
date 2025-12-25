import type { ClockPort } from "../src/clock.port";
import type { LoggerPort } from "../src/logger.port";
import type { Prerequisite } from "./prerequisite.vo";
import { PrerequisiteVerificationOutcome } from "./prerequisite-verifier.port";

export const PrerequisitesError = { Failure: "prerequisites.failure" } as const;

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

/** @public */
export class Prerequisites {
  private readonly base = { component: "infra", operation: "startup" };

  constructor(private readonly deps: Dependencies) {}

  async check(prerequisites: Prerequisite[]) {
    const results = await Promise.all(
      prerequisites
        .filter((prerequisite) => prerequisite.enabled)
        .map(async (prerequisite) => ({
          prerequisite,
          outcome: await prerequisite.build().verify(),
        })),
    );

    const failed = results.filter(
      (result) => result.outcome.outcome === PrerequisiteVerificationOutcome.failure,
    );

    if (failed.length === 0) return this.deps.Logger.info({ message: "Prerequisites ok", ...this.base });

    for (const failure of failed) {
      this.deps.Logger.error({
        message: "Prerequisite failed",
        metadata: { label: failure.prerequisite.label, kind: failure.prerequisite.kind },
        // @ts-expect-error
        error: failure.outcome.error ?? { message: "unknown error" },
        ...this.base,
      });
    }

    throw new Error(PrerequisitesError.Failure);
  }
}
