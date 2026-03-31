import * as tools from "@bgord/tools";
import type { GenericJob } from "./job.types";
import type { JobRetryPolicyStrategy } from "./job-retry-policy.strategy";

export const JobRetryPolicyCompositeStrategyError = {
  MissingPolicies: "job.retry.policy.composite.strategy.error.missing.policies",
  MaxPolicies: "job.retry.policy.composite.strategy.error.max.policies",
};

export class JobRetryPolicyCompositeStrategy implements JobRetryPolicyStrategy {
  constructor(private readonly policies: ReadonlyArray<JobRetryPolicyStrategy>) {
    if (policies.length === 0) throw new Error(JobRetryPolicyCompositeStrategyError.MissingPolicies);
    if (policies.length > 5) throw new Error(JobRetryPolicyCompositeStrategyError.MaxPolicies);
  }

  evaluate(job: GenericJob, error: tools.NormalizedError): false | tools.Duration {
    let delay: tools.Duration = tools.Duration.ZERO;

    for (const policy of this.policies) {
      const result = policy.evaluate(job, error);

      if (!result) return false;

      delay = result;
    }

    return delay;
  }
}
