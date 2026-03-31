import type { Database } from "bun:sqlite";
import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { GenericJob, GenericJobSerialized } from "./job.types";
import type { JobClaimerPort } from "./job-claimer.port";

type Dependencies = { db: Database; Clock: ClockPort };

export class JobClaimerSqliteAdapter implements JobClaimerPort {
  constructor(private readonly deps: Dependencies) {}

  async claim(
    names: ReadonlyArray<GenericJob["name"]>,
    limit: tools.IntegerPositiveType,
  ): Promise<ReadonlyArray<GenericJobSerialized>> {
    const placeholders = names.map(() => "?").join(", ");

    return this.deps.db.transaction(() => {
      const jobs = this.deps.db
        .query<
          GenericJobSerialized,
          [...Array<GenericJob["name"]>, tools.TimestampValueType, tools.IntegerPositiveType]
        >(
          `SELECT id, correlationId, createdAt, name, revision, payload
           FROM jobs
           WHERE status = 'pending'
            AND name IN (${placeholders})
            AND claimableAt <= ?
           ORDER BY createdAt
           ASC LIMIT ?`,
        )
        .all(...names, this.deps.Clock.now().ms, limit);

      if (jobs.length) {
        const ids = jobs.map((row) => row.id);
        const idPlaceholders = ids.map(() => "?").join(", ");

        this.deps.db.run<Array<GenericJob["id"]>>(
          `UPDATE jobs SET status = 'claimed' WHERE id IN (${idPlaceholders})`,
          ids,
        );
      }

      return jobs;
    })();
  }
}
