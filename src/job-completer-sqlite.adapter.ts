import type { Database } from "bun:sqlite";
import type { GenericJob } from "./job.types";
import type { JobCompleterPort } from "./job-completer.port";

type Dependencies = { db: Database };

export class JobCompleterSqliteAdapter implements JobCompleterPort {
  constructor(private readonly deps: Dependencies) {}

  async complete(id: GenericJob["id"]): Promise<void> {
    this.deps.db.run<[GenericJob["id"]]>("UPDATE jobs SET status = 'completed' WHERE id = $id", [id]);
  }
}
