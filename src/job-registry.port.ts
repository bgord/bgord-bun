import type { GenericJob } from "./job.types";
import type { JobRetryPolicyStrategy } from "./job-retry-policy.strategy";

export const JobRegistryError = { NoAsyncSchema: "job.registry.no.async.schema" };

export type JobHandler<Job extends GenericJob> = (job: Job) => Promise<void>;

export interface JobRegistryPort<Job extends GenericJob> {
  readonly names: ReadonlyArray<GenericJob["name"]>;

  accepts(name: GenericJob["name"]): boolean;

  validate(raw: unknown): Job;

  getRetryPolicy(name: GenericJob["name"]): JobRetryPolicyStrategy;

  getHandler(name: GenericJob["name"]): JobHandler<Job>;
}
