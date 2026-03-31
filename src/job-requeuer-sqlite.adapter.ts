import type { Database } from "bun:sqlite";
import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { GenericJob } from "./job.types";
import type { JobRequeuerPort } from "./job-requeuer.port";

type Dependencies = { db: Database; Clock: ClockPort };

export class JobRequeuerSqliteAdapter implements JobRequeuerPort {
  constructor(private readonly deps: Dependencies) {}

  async requeue(
    id: GenericJob["id"],
    revision: GenericJob["revision"],
    delay: tools.Duration,
  ): Promise<void> {
    this.deps.db.run<[GenericJob["revision"], tools.TimestampValueType, GenericJob["id"]]>(
      "UPDATE jobs SET status = 'pending', revision = ?, claimableAt = ? WHERE id = ?",
      [revision, this.deps.Clock.now().add(delay).ms, id],
    );
  }
}
