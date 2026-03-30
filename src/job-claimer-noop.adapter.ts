import type { GenericJob, GenericJobSerialized } from "./job.types";
import type { JobClaimerPort } from "./job-claimer.port";

export class JobClaimerNoopAdapter implements JobClaimerPort {
  constructor(private readonly jobs: ReadonlyArray<GenericJobSerialized> = []) {}

  async claim(
    _names: ReadonlyArray<GenericJob["name"]>,
    _limit?: number,
  ): Promise<ReadonlyArray<GenericJobSerialized>> {
    return this.jobs;
  }
}
