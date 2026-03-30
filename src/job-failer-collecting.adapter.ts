import type { GenericJob } from "./job.types";
import type { JobFailerPort } from "./job-failer.port";

export class JobFailerCollectingAdapter implements JobFailerPort {
  readonly failed: Array<GenericJob["id"]> = [];

  async fail(id: GenericJob["id"]): Promise<void> {
    this.failed.push(id);
  }
}
