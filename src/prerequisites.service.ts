import type { ClockPort } from "../src/clock.port";
import type { ErrorInfo, LoggerPort } from "../src/logger.port";
import { formatError } from "../src/logger-format-error.service";

export enum PrerequisiteVerificationOutcome {
  success = "success",
  failure = "failure",
  undetermined = "undetermined",
}

export type PrerequisiteVerificationSuccess = { outcome: PrerequisiteVerificationOutcome.success };
export type PrerequisiteVerificationFailure = {
  outcome: PrerequisiteVerificationOutcome.failure;
  error?: ErrorInfo;
};
export type PrerequisiteVerificationUndetermined = { outcome: PrerequisiteVerificationOutcome.undetermined };
export type PrerequisiteVerificationResult =
  | PrerequisiteVerificationSuccess
  | PrerequisiteVerificationFailure
  | PrerequisiteVerificationUndetermined;

export type PrerequisiteLabelType = string;

export interface Prerequisite {
  readonly label: PrerequisiteLabelType;
  readonly enabled?: boolean;
  verify(clock: ClockPort): Promise<PrerequisiteVerificationResult>;

  get kind(): string;
}

export class PrerequisiteVerification {
  static success = { outcome: PrerequisiteVerificationOutcome.success };

  static failure(meta?: Error | ErrorInfo): PrerequisiteVerificationFailure {
    return {
      outcome: PrerequisiteVerificationOutcome.failure,
      error: meta instanceof Error ? formatError(meta) : meta,
    };
  }

  static undetermined = { outcome: PrerequisiteVerificationOutcome.undetermined };
}

export type PrerequisiteConfigType = { label: string; enabled?: boolean };

export const PrerequisitesError = { Failure: "prerequisites.failure" } as const;

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

/** @public */
export class Prerequisites {
  private readonly base = { component: "infra", operation: "startup" };

  constructor(private readonly deps: Dependencies) {}

  async check(prerequisites: Prerequisite[]) {
    const results = await Promise.all(
      prerequisites.map(async (prerequisite) => ({
        prerequisite,
        outcome: await prerequisite.verify(this.deps.Clock),
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
