import type * as tools from "@bgord/tools";
import type { GenericJob } from "./job.types";
import type { JobClaimerPort } from "./job-claimer.port";
import type { JobCompleterPort } from "./job-completer.port";
import type { JobEnqueuerPort } from "./job-enqueuer.port";
import type { JobFailerPort } from "./job-failer.port";
import type { JobQueuePort } from "./job-queue.port";
import type { JobRegistryPort } from "./job-registry.port";
import type { JobRequeuerPort } from "./job-requeuer.port";
import type { JobRetryPolicyStrategy } from "./job-retry-policy.strategy";
import type { PayloadSerializerPort } from "./payload-serializer.port";

type Config<Job extends GenericJob> = {
  registry: JobRegistryPort<Job>;
  enqueuer: JobEnqueuerPort;
  claimer: JobClaimerPort;
  completer: JobCompleterPort;
  failer: JobFailerPort;
  requeuer: JobRequeuerPort;
  serializer: PayloadSerializerPort;
};

export class JobQueueAdapter<Job extends GenericJob> implements JobQueuePort<Job> {
  constructor(private readonly config: Config<Job>) {}

  async enqueue<EnqueuedJob extends Job>(job: EnqueuedJob): Promise<EnqueuedJob> {
    const serialized = await this.config.enqueuer.enqueue({
      ...job,
      payload: this.config.serializer.serialize(job.payload),
    });

    return { ...serialized, payload: this.config.serializer.deserialize(serialized.payload) } as EnqueuedJob;
  }

  async claim(limit?: tools.IntegerPositiveType): Promise<ReadonlyArray<Job>> {
    const jobs = await this.config.claimer.claim(this.config.registry.names, limit);

    return jobs
      .map((job) => ({ ...job, payload: this.config.serializer.deserialize(job.payload) }))
      .map((job) => this.config.registry.validate(job));
  }

  async complete(id: GenericJob["id"]): Promise<void> {
    return this.config.completer.complete(id);
  }

  async fail(id: GenericJob["id"]): Promise<void> {
    return this.config.failer.fail(id);
  }

  async requeue(
    id: GenericJob["id"],
    revision: GenericJob["revision"],
    delay: tools.Duration,
  ): Promise<void> {
    return this.config.requeuer.requeue(id, revision, delay);
  }

  getRetryPolicy(name: GenericJob["name"]): JobRetryPolicyStrategy {
    return this.config.registry.getRetryPolicy(name);
  }
}
