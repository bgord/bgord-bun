import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { GenericJob } from "./job.types";
import { JobRegistryError, type JobRegistryPort } from "./job-registry.port";
import type { JobRetryPolicyStrategy } from "./job-retry-policy.strategy";

export type JobRegistryEntry<Job> = { schema: StandardSchemaV1<unknown, Job>; retry: JobRetryPolicyStrategy };

export type GenericJobRegistry<Job> = Readonly<Record<GenericJob["name"], JobRegistryEntry<Job>>>;

const JobRegistryAdapterError = {
  MissingName: "job.registry.adapter.error.missing.name",
  UnknownJob: "job.registry.adapter.error.unknown.job",
};

export class JobRegistryAdapter<Job> implements JobRegistryPort<Job> {
  private readonly map: Map<GenericJob["name"], JobRegistryEntry<Job>>;
  readonly names: ReadonlyArray<GenericJob["name"]>;

  constructor(registry: GenericJobRegistry<Job>) {
    this.map = new Map(Object.entries(registry));
    this.names = Object.keys(registry);
  }

  accepts(name: GenericJob["name"]): boolean {
    return this.map.has(name);
  }

  validate(raw: unknown): Job {
    const name = (raw as { name?: GenericJob["name"] }).name;
    if (!name) throw new Error(JobRegistryAdapterError.MissingName);

    const entry = this.map.get(name);
    if (!entry) throw new Error(JobRegistryAdapterError.UnknownJob);

    const result = entry.schema["~standard"].validate(raw);

    if (result instanceof Promise) throw new Error(JobRegistryError.NoAsyncSchema);
    if (result.issues) throw new Error(result.issues[0]?.message);
    return result.value;
  }

  getRetryPolicy(name: GenericJob["name"]): JobRetryPolicyStrategy {
    const entry = this.map.get(name);

    if (!entry) throw new Error(JobRegistryAdapterError.UnknownJob);
    return entry.retry;
  }
}
