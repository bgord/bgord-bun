import type * as tools from "@bgord/tools";
import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { GenericJob } from "./job.types";
import type { JobQueuePort } from "./job-queue.port";
import type { JobHandler } from "./job-registry.port";
import type { JobRetryPolicyStrategy } from "./job-retry-policy.strategy";
import type { LoggerPort } from "./logger.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies<Job extends GenericJob> = {
  inner: JobQueuePort<Job>;
  Logger: LoggerPort;
  Clock: ClockPort;
};

export class JobQueueWithLoggerAdapter<Job extends GenericJob> implements JobQueuePort<Job> {
  private readonly base = { component: "infra", operation: "job_queue" };

  constructor(private readonly deps: Dependencies<Job>) {}

  async enqueue<EnqueuedJob extends Job>(job: EnqueuedJob, delay?: tools.Duration): Promise<EnqueuedJob> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Job queue enqueue attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { job, delay },
        ...this.base,
      });

      const result = await this.deps.inner.enqueue(job, delay);

      this.deps.Logger.info({
        message: "Job queue enqueue success",
        correlationId: CorrelationStorage.get(),
        metadata: { job, delay, duration: duration.stop() },
        ...this.base,
      });

      return result;
    } catch (error) {
      this.deps.Logger.error({
        message: "Job queue enqueue error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { job, delay, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  async claim(limit: tools.IntegerPositiveType): Promise<ReadonlyArray<Job>> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Job queue claim attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { limit },
        ...this.base,
      });

      const jobs = await this.deps.inner.claim(limit);

      this.deps.Logger.info({
        message: "Job queue claim success",
        correlationId: CorrelationStorage.get(),
        metadata: { limit, count: jobs.length, jobs, duration: duration.stop() },
        ...this.base,
      });

      return jobs;
    } catch (error) {
      this.deps.Logger.error({
        message: "Job queue claim error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { limit, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  async complete(id: GenericJob["id"]): Promise<void> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Job queue complete attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { id },
        ...this.base,
      });

      await this.deps.inner.complete(id);

      this.deps.Logger.info({
        message: "Job queue complete success",
        correlationId: CorrelationStorage.get(),
        metadata: { id, duration: duration.stop() },
        ...this.base,
      });
    } catch (error) {
      this.deps.Logger.error({
        message: "Job queue complete error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { id, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  async fail(id: GenericJob["id"]): Promise<void> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.warn({
        message: "Job queue fail attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { id },
        ...this.base,
      });

      await this.deps.inner.fail(id);

      this.deps.Logger.warn({
        message: "Job queue fail success",
        correlationId: CorrelationStorage.get(),
        metadata: { id, duration: duration.stop() },
        ...this.base,
      });
    } catch (error) {
      this.deps.Logger.error({
        message: "Job queue fail error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { id, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  async requeue(
    id: GenericJob["id"],
    revision: GenericJob["revision"],
    delay: tools.Duration,
  ): Promise<void> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.warn({
        message: "Job queue requeue attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { id, revision, delay },
        ...this.base,
      });

      await this.deps.inner.requeue(id, revision, delay);

      this.deps.Logger.warn({
        message: "Job queue requeue success",
        correlationId: CorrelationStorage.get(),
        metadata: { id, revision, delay, duration: duration.stop() },
        ...this.base,
      });
    } catch (error) {
      this.deps.Logger.error({
        message: "Job queue requeue error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { id, revision, delay, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  getRetryPolicy(name: GenericJob["name"]): JobRetryPolicyStrategy {
    return this.deps.inner.getRetryPolicy(name);
  }

  getHandler(name: GenericJob["name"]): JobHandler<Job> {
    return this.deps.inner.getHandler(name);
  }
}
