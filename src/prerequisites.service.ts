import type * as tools from "@bgord/tools";
import type { ErrorInfo, LoggerPort } from "../src/logger.port";
import { formatError } from "../src/logger-format-error.service";

export type PrerequisiteLabelType = string;

export enum PrerequisiteStatusEnum {
  success = "success",
  failure = "failure",
  undetermined = "undetermined",
}

export type VerifySuccess = Readonly<{ status: PrerequisiteStatusEnum.success }>;
export type VerifyFailure = Readonly<{ status: PrerequisiteStatusEnum.failure; error?: ErrorInfo }>;
export type VerifyUndetermined = Readonly<{ status: PrerequisiteStatusEnum.undetermined }>;
export type VerifyOutcome = VerifySuccess | VerifyFailure | VerifyUndetermined;

export interface Prerequisite {
  readonly label: PrerequisiteLabelType;
  readonly kind: string;
  readonly enabled?: boolean;
  verify(): Promise<VerifyOutcome>;
}

export type PrerequisiteResult = Readonly<{
  label: PrerequisiteLabelType;
  status: PrerequisiteStatusEnum;
  checkedAt: tools.TimestampType;
  durationMs: number;
  kind: string;
  error?: ErrorInfo;
}>;

export class Verification {
  static success(): VerifySuccess {
    return { status: PrerequisiteStatusEnum.success };
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

/** @public */
export class Prerequisites {
  constructor(private readonly logger: LoggerPort) {}

  async check(prerequisites: Prerequisite[]) {
    const results = await Promise.all(
      prerequisites.map(async (prerequisite) => ({ prerequisite, outcome: await prerequisite.verify() })),
    );

    const failed = results.filter((result) => result.outcome.status === PrerequisiteStatusEnum.failure);

    if (failed.length === 0) {
      return this.logger.info({ message: "Prerequisites ok", component: "infra", operation: "startup" });
    }

    for (const failure of failed) {
      this.logger.error({
        component: "infra",
        operation: "startup",
        message: "Prerequisite failed",
        metadata: { label: failure.prerequisite.label, kind: failure.prerequisite.kind },
        // @ts-expect-error
        error: failure.outcome.error ?? { message: "unknown error" },
      });
    }

    throw new Error("Prerequisites failed");
  }
}
