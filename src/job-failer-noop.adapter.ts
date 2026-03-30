import type { GenericJob } from "./job.types";
import type { JobFailerPort } from "./job-failer.port";

export class JobFailerNoopAdapter implements JobFailerPort {
  async fail(_id: GenericJob["id"]): Promise<void> {}
}
