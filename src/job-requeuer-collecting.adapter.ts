import type * as tools from "@bgord/tools";
import type { GenericJob } from "./job.types";
import type { JobRequeuerPort } from "./job-requeuer.port";

type RequeueEntry = { id: GenericJob["id"]; revision: GenericJob["revision"]; delay: tools.Duration };

export class JobRequeuerCollectingAdapter implements JobRequeuerPort {
  readonly requeued: Array<RequeueEntry> = [];

  async requeue(
    id: GenericJob["id"],
    revision: GenericJob["revision"],
    delay: tools.Duration,
  ): Promise<void> {
    this.requeued.push({ id, revision, delay });
  }
}
