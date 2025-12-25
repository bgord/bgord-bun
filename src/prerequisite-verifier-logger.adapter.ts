import type { ErrorInfo, LoggerPort } from "./logger.port";
import { PrerequisiteVerificationOutcome, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

type Dependencies = { Logger: LoggerPort };

export class PrerequisiteVerifierLoggerAdapter implements PrerequisiteVerifierPort {
  private readonly base = { component: "infra", operation: "prerequisite_verify" };

  constructor(
    private readonly config: { inner: PrerequisiteVerifierPort },
    private readonly deps: Dependencies,
  ) {}

  async verify() {
    const result = await this.config.inner.verify();

    switch (result.outcome) {
      case PrerequisiteVerificationOutcome.success: {
        this.deps.Logger.info({ message: `Success - ${this.kind}`, ...this.base });
        break;
      }
      case PrerequisiteVerificationOutcome.failure: {
        this.deps.Logger.error({
          message: `Failure - ${this.kind}`,
          error: result.error as ErrorInfo,
          ...this.base,
        });
        break;
      }
      case PrerequisiteVerificationOutcome.undetermined: {
        this.deps.Logger.info({ message: `Undetermined - ${this.kind}`, ...this.base });
        break;
      }
    }

    return result;
  }

  get kind() {
    return this.config.inner.kind;
  }
}
