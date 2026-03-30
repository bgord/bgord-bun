import type { GenericJob } from "./job.types";

export interface JobFailerPort {
  fail(id: GenericJob["id"]): Promise<void>;
}
