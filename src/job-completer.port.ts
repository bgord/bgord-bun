import type { GenericJob } from "./job.types";

export interface JobCompleterPort {
  complete(id: GenericJob["id"]): Promise<void>;
}
