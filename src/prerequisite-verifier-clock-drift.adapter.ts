import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import { PrerequisiteVerification, type PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import type { TimekeeperPort } from "./timekeeper.port";

type Dependencies = { Clock: ClockPort; Timekeeper: TimekeeperPort };

export class PrerequisiteVerifierClockDriftAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: { skew: tools.Duration },
    private readonly deps: Dependencies,
  ) {}

  async verify() {
    try {
      const timestamp = await this.deps.Timekeeper.get();

      if (!timestamp) return PrerequisiteVerification.undetermined;

      const duration = this.deps.Clock.now().difference(timestamp).toAbsolute();

      if (duration.isShorterThan(this.config.skew)) return PrerequisiteVerification.success;
      return PrerequisiteVerification.failure({ message: `Difference: ${duration.seconds}s` });
    } catch (error) {
      return PrerequisiteVerification.undetermined;
    }
  }

  get kind() {
    return "clock-drift";
  }
}
