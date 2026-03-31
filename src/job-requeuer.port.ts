import type * as tools from "@bgord/tools";
import type { GenericJob } from "./job.types";

export interface JobRequeuerPort {
  requeue(id: GenericJob["id"], revision: GenericJob["revision"], delay: tools.Duration): Promise<void>;
}
