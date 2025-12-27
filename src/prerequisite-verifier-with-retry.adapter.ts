import type { ErrorInfo } from "./logger.port";
import {
  PrerequisiteVerification,
  PrerequisiteVerificationOutcome,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";
import { Retry, type RetryConfigType } from "./retry.service";

export class PrerequisiteVerifierWithRetryAdapter implements PrerequisiteVerifierPort {
  constructor(private readonly config: { inner: PrerequisiteVerifierPort; retry: RetryConfigType }) {}

  async verify() {
    try {
      return await Retry.run<PrerequisiteVerificationResult>(async () => {
        const result = await this.config.inner.verify();

        if (result.outcome === PrerequisiteVerificationOutcome.failure) throw result.error;
        return result;
      }, this.config.retry);
    } catch (error) {
      return PrerequisiteVerification.failure(error as ErrorInfo);
    }
  }

  get kind() {
    return this.config.inner.kind;
  }
}
