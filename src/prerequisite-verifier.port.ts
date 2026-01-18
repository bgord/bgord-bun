import { formatError } from "./format-error.service";
import type { ErrorInfo } from "./logger.port";

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

export interface PrerequisiteVerifierPort {
  verify(): Promise<PrerequisiteVerificationResult>;

  get kind(): string;
}
