import type { GenericJob } from "./job.types";

export const JobValidatorRegistryError = { NoAsyncSchema: "job.validator.registry.no.async.schema" };

export interface JobValidatorRegistryPort<Job> {
  readonly names: ReadonlyArray<GenericJob["name"]>;

  accepts(name: GenericJob["name"]): boolean;

  validate(raw: unknown): Job;
}
