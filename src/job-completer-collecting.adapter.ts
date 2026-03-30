import type { GenericJob } from "./job.types";
import type { JobCompleterPort } from "./job-completer.port";

export class JobCompleterCollectingAdapter implements JobCompleterPort {
  readonly completed: Array<GenericJob["id"]> = [];

  async complete(id: GenericJob["id"]): Promise<void> {
    this.completed.push(id);
  }
}
