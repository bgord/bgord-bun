import { ErrorInfo, ErrorNormalizer } from "./error-normalizer.service";

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

  static failure(meta?: unknown): PrerequisiteVerificationFailure {
    return {
      outcome: PrerequisiteVerificationOutcome.failure,
      error: meta ? ErrorNormalizer.normalize(meta) : undefined,
    };
  }

  static undetermined = { outcome: PrerequisiteVerificationOutcome.undetermined };
}

export interface PrerequisiteVerifierPort {
  verify(): Promise<PrerequisiteVerificationResult>;

  get kind(): string;
}
