import type { Database } from "bun:sqlite";
import type { GenericJob } from "./job.types";
import type { JobFailerPort } from "./job-failer.port";
import { JobStatusEnum } from "./job-status.vo";

type Dependencies = { db: Database };

export class JobFailerSqliteAdapter implements JobFailerPort {
  constructor(private readonly deps: Dependencies) {}

  async fail(id: GenericJob["id"]): Promise<void> {
    this.deps.db.run<[GenericJob["id"]]>(`UPDATE jobs SET status = '${JobStatusEnum.failed}' WHERE id = ?`, [
      id,
    ]);
  }
}
