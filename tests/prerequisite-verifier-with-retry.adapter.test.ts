import { describe, expect, jest, spyOn, test } from "bun:test";
import { PrerequisiteVerifierWithRetryAdapter } from "../src/prerequisite-verifier-with-retry.adapter";
import { RetryBackoffStrategyNoop } from "../src/retry-backoff-strategy-noop";
import * as mocks from "./mocks";

const max = 3;
const backoff = new RetryBackoffStrategyNoop();
const retry = { max, backoff };

const pass = new mocks.PrerequisiteVerifierPass();
const fail = new mocks.PrerequisiteVerifierFail();
const failThenPass = new mocks.PrerequisiteVerifierFailThenPass();

describe("PrerequisiteVerifierWithRetryAdapter", () => {
  test("success", async () => {
    const prerequisite = new PrerequisiteVerifierWithRetryAdapter({ inner: pass, retry });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    const failVerify = spyOn(fail, "verify");
    const bunSleep = spyOn(Bun, "sleep").mockImplementation(jest.fn());
    const prerequisite = new PrerequisiteVerifierWithRetryAdapter({ inner: fail, retry });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(3);
    expect(bunSleep).toHaveBeenCalledTimes(2);
  });

  test("failure then success", async () => {
    const failThenPassVerify = spyOn(failThenPass, "verify");
    const bunSleep = spyOn(Bun, "sleep").mockImplementation(jest.fn());
    const prerequisite = new PrerequisiteVerifierWithRetryAdapter({ inner: failThenPass, retry });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(failThenPassVerify).toHaveBeenCalledTimes(3);
    expect(bunSleep).toHaveBeenCalledTimes(2);
  });

  test("preserves kind", () => {
    const prerequisite = new PrerequisiteVerifierWithRetryAdapter({ inner: pass, retry });

    expect(prerequisite.kind).toEqual(pass.kind);
  });
});
