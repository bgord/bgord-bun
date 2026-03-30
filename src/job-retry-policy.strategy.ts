import type * as tools from "@bgord/tools";
import type { GenericJob } from "./job.types";

export interface JobRetryPolicyStrategy {
  evaluate(job: GenericJob, error: tools.NormalizedError): false | tools.Duration;
}
