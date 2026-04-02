import type * as tools from "@bgord/tools";
import type { GenericJob } from "./job.types";
import type { JobRetryPolicyStrategy } from "./job-retry-policy.strategy";

export class JobRetryPolicyNoopStrategy implements JobRetryPolicyStrategy {
  evaluate(_job: GenericJob, _error: tools.NormalizedError): false | tools.Duration {
    return false;
  }
}
