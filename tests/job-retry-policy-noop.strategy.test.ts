import { describe, expect, test } from "bun:test";
import { JobRetryPolicyNoopStrategy } from "../src/job-retry-policy-noop.strategy";
import * as mocks from "./mocks";

const policy = new JobRetryPolicyNoopStrategy();

describe("JobRetryPolicyNoopStrategy", () => {
  test("happy path", () => {
    expect(policy.evaluate(mocks.GenericSendEmailJob, mocks.IntentionalErrorNormalized)).toEqual(false);
  });
});
