import type * as tools from "@bgord/tools";
import type { GenericJobSerialized } from "./job.types";

export interface JobEnqueuerPort {
  enqueue(job: GenericJobSerialized, delay?: tools.Duration): Promise<GenericJobSerialized>;
}
