import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";
import type { TimekeeperPort } from "./timekeeper.port";
import { TimekeeperGoogleAdapter } from "./timekeeper-google.adapter";
import { Timeout } from "./timeout.service";

type Dependencies = { Clock: ClockPort; Timekeeper?: TimekeeperPort };

export class PrerequisiteVerifierClockDriftAdapter implements PrerequisiteVerifierPort {
  readonly label: prereqs.PrerequisiteLabelType;

  readonly skew: tools.Duration;
  readonly timeout: tools.Duration;

  constructor(
    config: prereqs.PrerequisiteConfigType & { skew: tools.Duration; timeout?: tools.Duration },
    private readonly deps: Dependencies,
  ) {
    this.label = config.label;

    this.skew = config.skew;
    this.timeout = config.timeout ?? tools.Duration.Seconds(2);
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const Timekeeper = this.deps?.Timekeeper ?? new TimekeeperGoogleAdapter();

    try {
      const timestamp = await Timeout.cancellable(
        (signal: AbortSignal) => Timekeeper.get(signal),
        this.timeout,
      );
      if (!timestamp) return prereqs.PrerequisiteVerification.undetermined;

      const duration = this.deps.Clock.now().difference(timestamp).toAbsolute();

      if (duration.isShorterThan(this.skew)) return prereqs.PrerequisiteVerification.success;
      return prereqs.PrerequisiteVerification.failure({ message: `Difference: ${duration.seconds}s` });
    } catch (error) {
      return prereqs.PrerequisiteVerification.undetermined;
    }
  }

  get kind() {
    return "clock-drift";
  }
}
