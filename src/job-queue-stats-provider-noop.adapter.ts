import * as tools from "@bgord/tools";
import type { JobQueueStatsProviderPort, JobQueueStatsSnapshot } from "./job-queue-stats-provider.port";

export class JobQueueStatsProviderNoopAdapter implements JobQueueStatsProviderPort {
  async getStats(): Promise<JobQueueStatsSnapshot> {
    const zero = tools.Int.nonNegative(0);

    return { pending: zero, claimed: zero, completed: zero, failed: zero, oldestPending: null };
  }
}
