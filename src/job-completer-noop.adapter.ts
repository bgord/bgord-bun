import type { GenericJob } from "./job.types";
import type { JobCompleterPort } from "./job-completer.port";

export class JobCompleterNoopAdapter implements JobCompleterPort {
  async complete(_id: GenericJob["id"]): Promise<void> {}
}
