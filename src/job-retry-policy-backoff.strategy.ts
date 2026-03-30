import * as tools from "@bgord/tools";
import type { GenericJob } from "./job.types";
import type { JobRetryPolicyStrategy } from "./job-retry-policy.strategy";
import type { RetryBackoffStrategy } from "./retry-backoff.strategy";

export class JobRetryPolicyBackoffStrategy implements JobRetryPolicyStrategy {
  constructor(private readonly backoff: RetryBackoffStrategy) {}

  evaluate(job: GenericJob, _error: tools.NormalizedError): false | tools.Duration {
    return this.backoff.next(tools.Int.positive(job.revision + 1));
  }
}
