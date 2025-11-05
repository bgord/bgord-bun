import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";
import type { TimekeeperPort } from "../timekeeper.port";
import { Timeout } from "../timeout.service";

export class PrerequisiteClockDrift implements prereqs.Prerequisite {
  readonly kind = "clock-drift";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  readonly skew: tools.Duration;
  readonly timekeeper: TimekeeperPort;
  readonly timeout: tools.Duration;

  constructor(
    config: prereqs.PrerequisiteConfigType & {
      skew: tools.Duration;
      timekeeper: TimekeeperPort;
      timeout?: tools.Duration;
    },
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.skew = config.skew;
    this.timekeeper = config.timekeeper;
    this.timeout = config.timeout ?? tools.Duration.Seconds(3);
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    try {
      const timestamp = await Timeout.cancellable(
        (signal: AbortSignal) => this.timekeeper.get(signal),
        this.timeout,
      );
      if (!timestamp) return prereqs.Verification.undetermined(stopwatch.stop());

      const duration = clock.now().difference(timestamp).toAbsolute();

      if (duration.isShorterThan(this.skew)) return prereqs.Verification.success(stopwatch.stop());
      return prereqs.Verification.failure(stopwatch.stop(), { message: `Difference: ${duration.seconds}s` });
    } catch (error) {
      return prereqs.Verification.undetermined(stopwatch.stop());
    }
  }
}
