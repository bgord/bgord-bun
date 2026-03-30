import type * as tools from "@bgord/tools";
import type { GenericJobSerialized } from "./job.types";
import type { JobEnqueuerPort } from "./job-enqueuer.port";

export class JobEnqueuerCollectingAdapter implements JobEnqueuerPort {
  readonly enqueued: Array<{ job: GenericJobSerialized; delay?: tools.Duration }> = [];

  async enqueue(
    jobs: ReadonlyArray<GenericJobSerialized>,
    delay?: tools.Duration,
  ): Promise<ReadonlyArray<GenericJobSerialized>> {
    for (const job of jobs) {
      this.enqueued.push({ job, delay });
    }
    return jobs;
  }
}
