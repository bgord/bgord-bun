import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";
import type { TimekeeperPort } from "../timekeeper.port";
import { TimekeeperGoogleAdapter } from "../timekeeper-google.adapter";
import { Timeout } from "../timeout.service";

type Dependencies = { Clock: ClockPort; Timekeeper?: TimekeeperPort };

export class PrerequisiteClockDrift implements prereqs.Prerequisite {
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  readonly skew: tools.Duration;
  readonly timeout: tools.Duration;

  constructor(
    config: prereqs.PrerequisiteConfigType & { skew: tools.Duration; timeout?: tools.Duration },
    private readonly deps: Dependencies,
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.skew = config.skew;
    this.timeout = config.timeout ?? tools.Duration.Seconds(2);
  }

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const Timekeeper = this.deps?.Timekeeper ?? new TimekeeperGoogleAdapter();

    if (!this.enabled) return prereqs.Verification.undetermined();

    try {
      const timestamp = await Timeout.cancellable(
        (signal: AbortSignal) => Timekeeper.get(signal),
        this.timeout,
      );
      if (!timestamp) return prereqs.Verification.undetermined();

      const duration = this.deps.Clock.now().difference(timestamp).toAbsolute();

      if (duration.isShorterThan(this.skew)) return prereqs.Verification.success();
      return prereqs.Verification.failure({ message: `Difference: ${duration.seconds}s` });
    } catch (error) {
      return prereqs.Verification.undetermined();
    }
  }

  get kind() {
    return "clock-drift";
  }
}
