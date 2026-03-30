import * as tools from "@bgord/tools";
import type { GenericJob } from "./job.types";
import type { JobRetryPolicyStrategy } from "./job-retry-policy.strategy";

type Config = { retry: (error: tools.NormalizedError) => boolean };

export class JobRetryPolicyErrorFilterStrategy implements JobRetryPolicyStrategy {
  constructor(private readonly config: Config) {}

  evaluate(_job: GenericJob, error: tools.NormalizedError): false | tools.Duration {
    if (!this.config.retry(error)) return false;
    return tools.Duration.MIN;
  }
}
