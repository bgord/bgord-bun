import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { PrerequisiteVerifierPort } from "./prerequisite-verifier.port";
import * as prereqs from "./prerequisites.service";
import type { TimekeeperPort } from "./timekeeper.port";
import { TimekeeperGoogleAdapter } from "./timekeeper-google.adapter";

type Dependencies = { Clock: ClockPort; Timekeeper?: TimekeeperPort };

export class PrerequisiteVerifierClockDriftAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: { skew: tools.Duration },
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<prereqs.PrerequisiteVerificationResult> {
    const Timekeeper = this.deps?.Timekeeper ?? new TimekeeperGoogleAdapter();

    try {
      const timestamp = await Timekeeper.get();

      if (!timestamp) return prereqs.PrerequisiteVerification.undetermined;

      const duration = this.deps.Clock.now().difference(timestamp).toAbsolute();

      if (duration.isShorterThan(this.config.skew)) return prereqs.PrerequisiteVerification.success;
      return prereqs.PrerequisiteVerification.failure({ message: `Difference: ${duration.seconds}s` });
    } catch (error) {
      return prereqs.PrerequisiteVerification.undetermined;
    }
  }

  get kind() {
    return "clock-drift";
  }
}
