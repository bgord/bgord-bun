import type { Database } from "bun:sqlite";
import type { GenericJob } from "./job.types";
import type { JobFailerPort } from "./job-failer.port";

type Dependencies = { db: Database };

export class JobFailerSqliteAdapter implements JobFailerPort {
  constructor(private readonly deps: Dependencies) {}

  async fail(id: GenericJob["id"]): Promise<void> {
    this.deps.db.run("UPDATE jobs SET status = 'failed' WHERE id = ?", [id]);
  }
}
