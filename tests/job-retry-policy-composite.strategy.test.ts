import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobRetryPolicyBackoffStrategy } from "../src/job-retry-policy-backoff.strategy";
import { JobRetryPolicyCompositeStrategy } from "../src/job-retry-policy-composite.strategy";
import { JobRetryPolicyErrorFilterStrategy } from "../src/job-retry-policy-error-filter.strategy";
import { JobRetryPolicyLimitStrategy } from "../src/job-retry-policy-limit.strategy";
import { RetryBackoffLinearStrategy } from "../src/retry-backoff-linear.strategy";
import * as mocks from "./mocks";

const base = tools.Duration.Seconds(1);

const backoff = new JobRetryPolicyBackoffStrategy(new RetryBackoffLinearStrategy(base));
const limit = new JobRetryPolicyLimitStrategy(tools.Int.nonNegative(3));
const pass = new JobRetryPolicyErrorFilterStrategy({ retry: () => true });
const fail = new JobRetryPolicyErrorFilterStrategy({ retry: () => false });

describe("JobRetryPolicyCompositeStrategy", () => {
  test("missing policies", () => {
    expect(() => new JobRetryPolicyCompositeStrategy([])).toThrow(
      "job.retry.policy.composite.strategy.error.missing.policies",
    );
  });

  test("just enough policies", () => {
    expect(() => new JobRetryPolicyCompositeStrategy(tools.repeat(limit, 5))).not.toThrow();
  });

  test("max policies", () => {
    expect(() => new JobRetryPolicyCompositeStrategy(tools.repeat(limit, 6))).toThrow(
      "job.retry.policy.composite.strategy.error.max.policies",
    );
  });

  test("all pass", () => {
    const composite = new JobRetryPolicyCompositeStrategy([limit, backoff]);

    expect(composite.evaluate(mocks.GenericSendEmailJob, mocks.IntentionalErrorNormalized)).toEqual(base);
  });

  test("first fails", () => {
    const composite = new JobRetryPolicyCompositeStrategy([fail, backoff]);

    expect(composite.evaluate(mocks.GenericSendEmailJob, mocks.IntentionalErrorNormalized)).toEqual(false);
  });

  test("middle fails", () => {
    const composite = new JobRetryPolicyCompositeStrategy([pass, limit, backoff]);
    const job = { ...mocks.GenericSendEmailJob, revision: 3 };

    expect(composite.evaluate(job, mocks.IntentionalErrorNormalized)).toEqual(false);
  });

  test("last fails", () => {
    const composite = new JobRetryPolicyCompositeStrategy([backoff, limit]);
    const job = { ...mocks.GenericSendEmailJob, revision: 3 };

    expect(composite.evaluate(job, mocks.IntentionalErrorNormalized)).toEqual(false);
  });
});
