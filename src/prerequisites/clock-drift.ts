import * as tools from "@bgord/tools";
import type { ClockPort } from "../clock.port";
import * as prereqs from "../prerequisites.service";
import type { TimekeeperPort } from "../timekeeper.port";

export class PrerequisiteClockDrift implements prereqs.Prerequisite {
  readonly kind = "clock-drift";
  readonly label: prereqs.PrerequisiteLabelType;
  readonly enabled?: boolean = true;

  readonly skew: tools.Duration;
  readonly timekeeper: TimekeeperPort;
  readonly clock: ClockPort;

  constructor(
    config: prereqs.PrerequisiteConfigType & {
      skew: tools.Duration;
      timekeeper: TimekeeperPort;
      clock: ClockPort;
    },
  ) {
    this.label = config.label;
    this.enabled = config.enabled === undefined ? true : config.enabled;

    this.skew = config.skew;
    this.timekeeper = config.timekeeper;
    this.clock = config.clock;
  }

  async verify(clock: ClockPort): Promise<prereqs.VerifyOutcome> {
    const stopwatch = new tools.Stopwatch(clock.now());

    if (!this.enabled) return prereqs.Verification.undetermined(stopwatch.stop());

    const now = this.clock.now();

    const timestamp = await this.timekeeper.get();
    if (!timestamp) return prereqs.Verification.undetermined(stopwatch.stop());

    const duration = now.difference(timestamp).toAbolute();

    if (duration.isShorterThan(this.skew)) return prereqs.Verification.success(stopwatch.stop());
    return prereqs.Verification.failure({ message: `Difference: ${duration.seconds}s` });
  }
}
