import type { Database } from "bun:sqlite";
import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import type { GenericJobSerialized } from "./job.types";
import type { JobEnqueuerPort } from "./job-enqueuer.port";

type Dependencies = { db: Database; Clock: ClockPort };

export class JobEnqueuerSqliteAdapter implements JobEnqueuerPort {
  constructor(private readonly deps: Dependencies) {}

  async enqueue(job: GenericJobSerialized, delay?: tools.Duration): Promise<GenericJobSerialized> {
    const claimableAt = delay ? this.deps.Clock.now().add(delay) : this.deps.Clock.now();

    this.deps.db.run<
      [
        GenericJobSerialized["id"],
        GenericJobSerialized["correlationId"],
        GenericJobSerialized["createdAt"],
        GenericJobSerialized["name"],
        GenericJobSerialized["revision"],
        GenericJobSerialized["payload"],
        tools.TimestampValueType,
      ]
    >(
      `INSERT INTO jobs (id, correlationId, createdAt, name, revision, payload, status, claimableAt)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [job.id, job.correlationId, job.createdAt, job.name, job.revision, job.payload, claimableAt.ms],
    );

    return job;
  }
}
