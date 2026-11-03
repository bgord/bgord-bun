import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { JobQueueStatsProviderPort } from "./job-queue-stats-provider.port";
import {
  PrerequisiteVerification,
  type PrerequisiteVerificationResult,
  type PrerequisiteVerifierPort,
} from "./prerequisite-verifier.port";

type Dependencies = { Clock: ClockPort; JobQueueStatsProvider: JobQueueStatsProviderPort };
type Config = { maximum: tools.Duration };

export class PrerequisiteVerifierJobQueueLagAdapter implements PrerequisiteVerifierPort {
  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  async verify(): Promise<PrerequisiteVerificationResult> {
    try {
      const { oldestPending } = await this.deps.JobQueueStatsProvider.getStats();

      if (oldestPending === null) return PrerequisiteVerification.success;

      const lag = this.deps.Clock.now().difference(tools.Timestamp.fromNumber(oldestPending));

      if (lag.isLongerThan(this.config.maximum)) {
        return PrerequisiteVerification.failure(`Lag: ${lag.seconds}s`);
      }
      return PrerequisiteVerification.success;
    } catch (error) {
      return PrerequisiteVerification.failure(error);
    }
  }

  get kind(): string {
    return "job-queue-lag";
  }
}
