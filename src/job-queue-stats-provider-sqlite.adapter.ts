import type { Database } from "bun:sqlite";
import * as tools from "@bgord/tools";
import type { JobQueueStatsProviderPort, JobQueueStatsSnapshot } from "./job-queue-stats-provider.port";

type Dependencies = { db: Database };

export class JobQueueStatsProviderSqliteAdapter implements JobQueueStatsProviderPort {
  constructor(private readonly deps: Dependencies) {}

  async getStats(): Promise<JobQueueStatsSnapshot> {
    const snapshot = this.deps.db
      .query<{ status: string; count: number }, []>(
        "SELECT status, COUNT(*) as count FROM jobs GROUP BY status",
      )
      .all();

    const oldest = this.deps.db
      .query<{ createdAt: number | null }, []>(
        "SELECT MIN(createdAt) as createdAt FROM jobs WHERE status = 'pending'",
      )
      .get();

    const counts = Object.fromEntries(snapshot.map((row) => [row.status, row.count]));

    return {
      pending: tools.Int.nonNegative(counts["pending"] ?? 0),
      claimed: tools.Int.nonNegative(counts["claimed"] ?? 0),
      completed: tools.Int.nonNegative(counts["completed"] ?? 0),
      failed: tools.Int.nonNegative(counts["failed"] ?? 0),
      oldestPending: oldest?.createdAt ? tools.Timestamp.fromNumber(oldest.createdAt).ms : null,
    };
  }
}
