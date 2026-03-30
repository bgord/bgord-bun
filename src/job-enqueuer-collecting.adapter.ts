import type * as tools from "@bgord/tools";
import type { GenericJobSerialized } from "./job.types";
import type { JobEnqueuerPort } from "./job-enqueuer.port";

export class JobEnqueuerCollectingAdapter implements JobEnqueuerPort {
  readonly enqueued: Array<{ job: GenericJobSerialized; delay?: tools.Duration }> = [];

  async enqueue(job: GenericJobSerialized, delay?: tools.Duration): Promise<GenericJobSerialized> {
    this.enqueued.push({ job, delay });

    return job;
  }
}
