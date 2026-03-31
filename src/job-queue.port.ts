import type * as tools from "@bgord/tools";
import type { GenericJob } from "./job.types";
import type { JobRetryPolicyStrategy } from "./job-retry-policy.strategy";

export interface JobQueuePort<Job extends GenericJob> {
  enqueue<EnqueuedJob extends Job>(job: EnqueuedJob): Promise<EnqueuedJob>;

  claim(limit: tools.IntegerPositiveType): Promise<ReadonlyArray<Job>>;

  complete(id: GenericJob["id"]): Promise<void>;

  fail(id: GenericJob["id"]): Promise<void>;

  requeue(id: GenericJob["id"], revision: GenericJob["revision"], delay: tools.Duration): Promise<void>;

  getRetryPolicy(name: GenericJob["name"]): JobRetryPolicyStrategy;
}
