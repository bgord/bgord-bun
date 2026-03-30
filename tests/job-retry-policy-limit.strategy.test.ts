import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobRetryPolicyLimitStrategy } from "../src/job-retry-policy-limit.strategy";
import * as mocks from "./mocks";

const policy = new JobRetryPolicyLimitStrategy(tools.Int.nonNegative(3));
const ZERO = tools.Duration.Ms(0);

describe("JobRetryPolicyLimitStrategy", () => {
  test("happy path", () => {
    expect(policy.evaluate(mocks.GenericSendEmailJob, mocks.IntentionalErrorNormalized)).toEqual(ZERO);
  });

  test("below limit", () => {
    const job = { ...mocks.GenericSendEmailJob, revision: 2 };

    expect(policy.evaluate(job, mocks.IntentionalErrorNormalized)).toEqual(ZERO);
  });

  test("at the limit", () => {
    const job = { ...mocks.GenericSendEmailJob, revision: 3 };

    expect(policy.evaluate(job, mocks.IntentionalErrorNormalized)).toEqual(false);
  });

  test("above limit", () => {
    const job = { ...mocks.GenericSendEmailJob, revision: 4 };

    expect(policy.evaluate(job, mocks.IntentionalErrorNormalized)).toEqual(false);
  });

  test("never retry", () => {
    const policy = new JobRetryPolicyLimitStrategy(tools.Int.nonNegative(0));

    expect(policy.evaluate(mocks.GenericSendEmailJob, mocks.IntentionalErrorNormalized)).toEqual(false);
  });
});
