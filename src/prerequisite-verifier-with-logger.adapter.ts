import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { LoggerPort } from "./logger.port";
import {
  PrerequisiteVerificationOutcome,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

export class PrerequisiteVerifierWithLoggerAdapter implements PrerequisiteVerifierPort {
  private readonly base = (duration: tools.Duration) => ({
    component: "infra",
    operation: "prerequisite_verify",
    metadata: { duration },
  });

  constructor(
    private readonly config: { inner: PrerequisiteVerifierPort },
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    const stopwatch = new Stopwatch(this.deps);
    const result = await this.config.inner.verify();
    const duration = stopwatch.stop();

    switch (result.outcome) {
      case PrerequisiteVerificationOutcome.success: {
        this.deps.Logger.info({ message: `Success - ${this.kind}`, ...this.base(duration) });
        break;
      }
      case PrerequisiteVerificationOutcome.failure: {
        this.deps.Logger.error({
          message: `Failure - ${this.kind}`,
          error: result.error,
          ...this.base(duration),
        });
        break;
      }
      case PrerequisiteVerificationOutcome.undetermined: {
        this.deps.Logger.info({ message: `Undetermined - ${this.kind}`, ...this.base(duration) });
        break;
      }
    }

    return result;
  }

  get kind(): string {
    return this.config.inner.kind;
  }
}
