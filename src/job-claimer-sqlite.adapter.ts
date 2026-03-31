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
    const now = this.deps.Clock.now().ms;

    const placeholders = names.map(() => "?").join(", ");

    return this.deps.db.transaction(() => {
      const found = this.deps.db
        .query(
          `SELECT id, correlationId, createdAt, name, revision, payload FROM jobs WHERE status = 'pending' AND name IN (${placeholders}) AND claimableAt <= ? ORDER BY createdAt ASC LIMIT ?`,
        )
        .all(...names, now, limit) as Array<GenericJobSerialized>;

      if (found.length > 0) {
        const ids = found.map((row) => row.id);
        const idPlaceholders = ids.map(() => "?").join(", ");

        this.deps.db.run(`UPDATE jobs SET status = 'claimed' WHERE id IN (${idPlaceholders})`, ids);
      }

      return found;
    })();
  }
}
