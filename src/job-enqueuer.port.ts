import type * as tools from "@bgord/tools";
import type { GenericJobSerialized } from "./job.types";

export interface JobEnqueuerPort {
  enqueue(
    jobs: ReadonlyArray<GenericJobSerialized>,
    delay?: tools.Duration,
  ): Promise<ReadonlyArray<GenericJobSerialized>>;
}
