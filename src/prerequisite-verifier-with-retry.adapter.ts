import type { ErrorInfo } from "./logger.port";
import {
  PrerequisiteVerification,
  PrerequisiteVerificationOutcome,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";
import { Retry, type RetryConfigType } from "./retry.service";
import type { SleeperPort } from "./sleeper.port";

type Dependencies = { Sleeper: SleeperPort };

export class PrerequisiteVerifierWithRetryAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: { inner: PrerequisiteVerifierPort; retry: RetryConfigType },
    private readonly deps: Dependencies,
  ) {}

  async verify() {
    try {
      return await new Retry(this.deps).run<PrerequisiteVerificationResult>(async () => {
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
