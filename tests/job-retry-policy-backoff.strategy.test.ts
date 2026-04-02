import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobRetryPolicyBackoffStrategy } from "../src/job-retry-policy-backoff.strategy";
import { RetryBackoffLinearStrategy } from "../src/retry-backoff-linear.strategy";
import * as mocks from "./mocks";

const base = tools.Duration.Seconds(1);
const backoff = new RetryBackoffLinearStrategy(base);
const policy = new JobRetryPolicyBackoffStrategy(backoff);

describe("JobRetryPolicyBackoffStrategy", () => {
  test("no failures", () => {
    const job = { ...mocks.GenericSendEmailJob, revision: 0 };

    expect(policy.evaluate(job, mocks.IntentionalErrorNormalized)).toEqual(base);
  });

  test("failure", () => {
    const first = policy.evaluate(
      { ...mocks.GenericSendEmailJob, revision: 0 },
      mocks.IntentionalErrorNormalized,
    );

    const second = policy.evaluate(
      { ...mocks.GenericSendEmailJob, revision: 1 },
      mocks.IntentionalErrorNormalized,
    );

    expect(first && second && second.isLongerThan(first)).toEqual(true);
  });
});
