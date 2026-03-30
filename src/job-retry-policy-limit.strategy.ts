import * as tools from "@bgord/tools";
import type { GenericJob } from "./job.types";
import type { JobRetryPolicyStrategy } from "./job-retry-policy.strategy";

export class JobRetryPolicyLimitStrategy implements JobRetryPolicyStrategy {
  constructor(private readonly retries: tools.IntegerNonNegativeType) {}

  evaluate(job: GenericJob, _error: tools.NormalizedError): false | tools.Duration {
    if (job.revision >= this.retries) return false;
    return tools.Duration.Ms(0);
  }
}
