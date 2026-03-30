import { describe, expect, test } from "bun:test";
import * as tools from "@bgord/tools";
import { JobRetryPolicyErrorFilterStrategy } from "../src/job-retry-policy-error-filter.strategy";
import * as mocks from "./mocks";

const ZERO = tools.Duration.Ms(0);

const policy = new JobRetryPolicyErrorFilterStrategy({ retry: (error) => error.message !== "fatal" });

describe("JobRetryPolicyErrorFilterStrategy", () => {
  test("retry", () => {
    expect(policy.evaluate(mocks.GenericSendEmailJob, mocks.IntentionalErrorNormalized)).toEqual(ZERO);
    expect(policy.evaluate(mocks.GenericSendEmailJob, { message: "fatal" })).toEqual(false);
  });
});
