// [BUN DEPENDENCY]
import type { Database } from "bun:sqlite";
import * as tools from "@bgord/tools";
import type { JobRecovererPort } from "./job-recoverer.port";
import { JobStatusEnum } from "./job-status.vo";

type Dependencies = { db: Database };

// Single-process only: at boot, every claimed job was left behind by a dead process.
export class JobRecovererSqliteAdapter implements JobRecovererPort {
  constructor(private readonly deps: Dependencies) {}

  async recover(): Promise<tools.IntegerNonNegativeType> {
    const result = this.deps.db.run(
      `UPDATE jobs SET status = '${JobStatusEnum.pending}' WHERE status = '${JobStatusEnum.claimed}'`,
    );

    return tools.Int.nonNegative(result.changes);
  }
}
