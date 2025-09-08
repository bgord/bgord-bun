import type * as tools from "@bgord/tools";
import type { ErrorInfo } from "../src/logger.port";
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
  static failure(error?: unknown): VerifyFailure {
    return { status: PrerequisiteStatusEnum.failure, error: formatError(error) };
  }
  static undetermined(): VerifyUndetermined {
    return { status: PrerequisiteStatusEnum.undetermined };
  }
}

export type PrerequisiteConfigType = { label: string; enabled?: boolean };

/** @public */
export class Prerequisites {
  static async check(prerequisites: Prerequisite[]) {
    try {
      const failedPrerequisiteLabels: PrerequisiteLabelType[] = [];

      for (const prerequisite of prerequisites) {
        const result = await prerequisite.verify();

        if (result.status === PrerequisiteStatusEnum.failure) {
          failedPrerequisiteLabels.push(prerequisite.label);
        }
      }

      if (failedPrerequisiteLabels.length > 0) {
        const failedPrerequisiteLabelsFormatted = failedPrerequisiteLabels.join(", ");

        console.log(`Prerequisites failed: ${failedPrerequisiteLabelsFormatted}, quitting...`);

        process.exit(1);
      }
    } catch (error) {
      console.log("Prerequisites error", String(error));
    }
  }
}
