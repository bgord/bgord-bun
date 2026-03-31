import type * as tools from "@bgord/tools";
import type { GenericJob } from "./job.types";
import type { JobQueuePort } from "./job-queue.port";
import type { JobHandler } from "./job-registry.port";
import type { JobRetryPolicyStrategy } from "./job-retry-policy.strategy";
import type { LoggerPort } from "./logger.port";

type Dependencies<Job extends GenericJob> = {
  inner: JobQueuePort<Job>;
  Logger: LoggerPort;
};

export class JobQueueWithLoggerAdapter<Job extends GenericJob> implements JobQueuePort<Job> {
  private readonly base = { component: "infra", operation: "job_queue" };

  constructor(private readonly deps: Dependencies<Job>) {}

  async enqueue<EnqueuedJob extends Job>(job: EnqueuedJob): Promise<EnqueuedJob> {
    this.deps.Logger.info({ message: `${job.name} enqueued`, metadata: job, ...this.base });

    return this.deps.inner.enqueue(job);
  }

  async claim(limit: tools.IntegerPositiveType): Promise<ReadonlyArray<Job>> {
    const jobs = await this.deps.inner.claim(limit);

    this.deps.Logger.info({
      message: `Claimed ${jobs.length} job(s)`,
      metadata: { count: jobs.length, limit, jobs },
      ...this.base,
    });

    return jobs;
  }

  async complete(id: GenericJob["id"]): Promise<void> {
    this.deps.Logger.info({ message: "Job completed", metadata: { id }, ...this.base });

    return this.deps.inner.complete(id);
  }

  async fail(id: GenericJob["id"]): Promise<void> {
    this.deps.Logger.warn({ message: "Job failed", metadata: { id }, ...this.base });

    return this.deps.inner.fail(id);
  }

  async requeue(
    id: GenericJob["id"],
    revision: GenericJob["revision"],
    delay: tools.Duration,
  ): Promise<void> {
    this.deps.Logger.warn({ message: "Job requeued", metadata: { id, revision, delay }, ...this.base });

    return this.deps.inner.requeue(id, revision, delay);
  }

  getRetryPolicy(name: GenericJob["name"]): JobRetryPolicyStrategy {
    return this.deps.inner.getRetryPolicy(name);
  }

  getHandler(name: GenericJob["name"]): JobHandler<Job> {
    return this.deps.inner.getHandler(name);
  }
}
