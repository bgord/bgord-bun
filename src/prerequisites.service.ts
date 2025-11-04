import type * as tools from "@bgord/tools";
import type { ClockPort } from "../src/clock.port";
import type { ErrorInfo, LoggerPort } from "../src/logger.port";
import { formatError } from "../src/logger-format-error.service";

export type PrerequisiteLabelType = string;

export enum PrerequisiteStatusEnum {
  success = "success",
  failure = "failure",
  undetermined = "undetermined",
}

export type VerifySuccess = { status: PrerequisiteStatusEnum.success; duration: tools.DurationMsType };
export type VerifyFailure = { status: PrerequisiteStatusEnum.failure; error?: ErrorInfo };
export type VerifyUndetermined = { status: PrerequisiteStatusEnum.undetermined };
export type VerifyOutcome = VerifySuccess | VerifyFailure | VerifyUndetermined;

export interface Prerequisite {
  readonly label: PrerequisiteLabelType;
  readonly kind: string;
  readonly enabled?: boolean;
  verify(clock: ClockPort): Promise<VerifyOutcome>;
}

export type PrerequisiteResult = {
  label: PrerequisiteLabelType;
  status: PrerequisiteStatusEnum;
  kind: string;
  error?: ErrorInfo;
};

export class Verification {
  static success(duration: tools.Duration): VerifySuccess {
    return { status: PrerequisiteStatusEnum.success, duration: duration.ms };
  }
  static failure(meta?: Error | ErrorInfo): VerifyFailure {
    return {
      status: PrerequisiteStatusEnum.failure,
      error: meta instanceof Error ? formatError(meta) : meta,
    };
  }
  static undetermined(): VerifyUndetermined {
    return { status: PrerequisiteStatusEnum.undetermined };
  }
}

export type PrerequisiteConfigType = { label: string; enabled?: boolean };

export const PrerequisitesError = { Failure: "prerequisites.failure" } as const;

type Dependencies = { logger: LoggerPort; clock: ClockPort };

/** @public */
export class Prerequisites {
  private readonly base = { component: "infra", operation: "startup" };

  constructor(private readonly deps: Dependencies) {}

  async check(prerequisites: Prerequisite[]) {
    const results = await Promise.all(
      prerequisites.map(async (prerequisite) => ({
        prerequisite,
        outcome: await prerequisite.verify(this.deps.clock),
      })),
    );

    const failed = results.filter((result) => result.outcome.status === PrerequisiteStatusEnum.failure);

    if (failed.length === 0) return this.deps.logger.info({ message: "Prerequisites ok", ...this.base });

    for (const failure of failed) {
      this.deps.logger.error({
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
