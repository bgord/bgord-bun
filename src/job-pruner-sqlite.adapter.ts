import type { Database } from "bun:sqlite";
import * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { JobPrunerPort } from "./job-pruner.port";

type Dependencies = { db: Database; Clock: ClockPort };

export class JobPrunerSqliteAdapter implements JobPrunerPort {
  constructor(private readonly deps: Dependencies) {}

  async prune(olderThan: tools.Duration): Promise<tools.IntegerNonNegativeType> {
    const threshold = this.deps.Clock.now().subtract(olderThan).ms;

    const result = this.deps.db.run<[tools.TimestampValueType]>(
      `DELETE FROM jobs
         WHERE status IN ('completed', 'failed')
           AND createdAt <= ?`,
      [threshold],
    );

    return tools.Int.nonNegative(result.changes);
  }
}
