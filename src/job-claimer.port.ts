import type { GenericJob, GenericJobSerialized } from "./job.types";

export interface JobClaimerPort {
  claim(
    names: ReadonlyArray<GenericJob["name"]>,
    limit?: number,
  ): Promise<ReadonlyArray<GenericJobSerialized>>;
}
