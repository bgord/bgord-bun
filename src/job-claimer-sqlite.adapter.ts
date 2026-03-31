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

    return this.deps.db
      .query<
        GenericJobSerialized,
        [...Array<GenericJob["name"]>, tools.TimestampValueType, tools.IntegerPositiveType]
      >(
        `UPDATE jobs SET status = 'claimed'
         WHERE id IN (
           SELECT id FROM jobs
           WHERE status = 'pending'
             AND name IN (${placeholders})
             AND claimableAt <= ?
           ORDER BY createdAt ASC
           LIMIT ?
         )
         RETURNING id, correlationId, createdAt, name, revision, payload`,
      )
      .all(...names, this.deps.Clock.now().ms, limit)
      .toSorted((a, b) => a.createdAt - b.createdAt);
  }
}
