import type * as tools from "@bgord/tools";
import type { GenericJob } from "./job.types";
import type { JobQueuePort } from "./job-queue.port";
import type { JobHandler, JobRegistryPort } from "./job-registry.port";
import type { JobRetryPolicyStrategy } from "./job-retry-policy.strategy";

type Config<Job extends GenericJob> = { registry: JobRegistryPort<Job> };

export class JobQueueAdapterNoop<Job extends GenericJob> implements JobQueuePort<Job> {
  constructor(private readonly config: Config<Job>) {}

  async enqueue<EnqueuedJob extends Job>(job: EnqueuedJob): Promise<EnqueuedJob> {
    return job;
  }

  async claim(_limit: tools.IntegerPositiveType): Promise<ReadonlyArray<Job>> {
    return [];
  }

  async complete(_id: GenericJob["id"]): Promise<void> {}

  async fail(_id: GenericJob["id"]): Promise<void> {}

  async requeue(
    _id: GenericJob["id"],
    _revision: GenericJob["revision"],
    _delay: tools.Duration,
  ): Promise<void> {}

  getRetryPolicy(name: GenericJob["name"]): JobRetryPolicyStrategy {
    return this.config.registry.getRetryPolicy(name);
  }

  getHandler(name: GenericJob["name"]): JobHandler<Job> {
    return this.config.registry.getHandler(name);
  }
}
