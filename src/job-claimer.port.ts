import type * as tools from "@bgord/tools";
import type { GenericJob, GenericJobSerialized } from "./job.types";

export interface JobClaimerPort {
  claim(
    names: ReadonlyArray<GenericJob["name"]>,
    _limit: tools.IntegerPositiveType,
  ): Promise<ReadonlyArray<GenericJobSerialized>>;
}
