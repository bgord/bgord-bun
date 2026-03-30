import type { GenericJob } from "./job.types";
import type { JobRetryPolicyStrategy } from "./job-retry-policy.strategy";

export const JobRegistryError = { NoAsyncSchema: "job.registry.no.async.schema" };

export interface JobRegistryPort<Job> {
  readonly names: ReadonlyArray<GenericJob["name"]>;

  accepts(name: GenericJob["name"]): boolean;

  validate(raw: unknown): Job;

  getRetryPolicy(name: GenericJob["name"]): JobRetryPolicyStrategy;
}
