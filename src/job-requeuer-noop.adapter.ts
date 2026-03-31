import type * as tools from "@bgord/tools";
import type { GenericJob } from "./job.types";
import type { JobRequeuerPort } from "./job-requeuer.port";

export class JobRequeuerNoopAdapter implements JobRequeuerPort {
  async requeue(
    _id: GenericJob["id"],
    _revision: GenericJob["revision"],
    _delay: tools.Duration,
  ): Promise<void> {}
}
