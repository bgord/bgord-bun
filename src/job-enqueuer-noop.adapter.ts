import type * as tools from "@bgord/tools";
import type { GenericJobSerialized } from "./job.types";
import type { JobEnqueuerPort } from "./job-enqueuer.port";

export class JobEnqueuerNoopAdapter implements JobEnqueuerPort {
  async enqueue(job: GenericJobSerialized, _delay?: tools.Duration): Promise<GenericJobSerialized> {
    return job;
  }
}
