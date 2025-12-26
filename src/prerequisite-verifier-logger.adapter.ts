import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { ErrorInfo, LoggerPort } from "./logger.port";
import { PrerequisiteVerificationOutcome, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";

type Dependencies = { Logger: LoggerPort; Clock: ClockPort };

export class PrerequisiteVerifierLoggerAdapter implements PrerequisiteVerifierPort {
  private readonly base = (durationMs: tools.DurationMsType) => ({
    component: "infra",
    operation: "prerequisite_verify",
    durationMs,
  });

  constructor(
    private readonly config: { inner: PrerequisiteVerifierPort },
    private readonly deps: Dependencies,
  ) {}

  async verify() {
    const stopwatch = new tools.Stopwatch(this.deps.Clock.now());
    const result = await this.config.inner.verify();
    const durationMs = stopwatch.stop().ms;

    switch (result.outcome) {
      case PrerequisiteVerificationOutcome.success: {
        this.deps.Logger.info({ message: `Success - ${this.kind}`, ...this.base(durationMs) });
        break;
      }
      case PrerequisiteVerificationOutcome.failure: {
        this.deps.Logger.error({
          message: `Failure - ${this.kind}`,
          error: result.error as ErrorInfo,
          ...this.base(durationMs),
        });
        break;
      }
      case PrerequisiteVerificationOutcome.undetermined: {
        this.deps.Logger.info({ message: `Undetermined - ${this.kind}`, ...this.base(durationMs) });
        break;
      }
    }

    return result;
  }

  get kind() {
    return this.config.inner.kind;
  }
}
