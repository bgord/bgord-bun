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

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      return await new Retry(this.deps).run<PrerequisiteVerificationResult>(async () => {
        const result = await this.config.inner.verify();

        // Stryker disable all
        if (result.outcome === PrerequisiteVerificationOutcome.failure) throw result.error?.message;
        // Stryker restore all
        return result;
      }, this.config.retry);
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return this.config.inner.kind;
  }
}
