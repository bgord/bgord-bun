import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierWithRetryAdapter } from "../src/prerequisite-verifier-with-retry.adapter";
import { RetryBackoffExponentialStrategy } from "../src/retry-backoff-exponential.strategy";
import { RetryBackoffNoopStrategy } from "../src/retry-backoff-noop.strategy";
import * as mocks from "./mocks";

const max = 3;
const backoff = new RetryBackoffNoopStrategy();
const exponential = new RetryBackoffExponentialStrategy(tools.Duration.Ms(1));
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

  test("exponential backoff", async () => {
    const failVerify = spyOn(fail, "verify");
    const bunSleep = spyOn(Bun, "sleep").mockImplementation(jest.fn());
    const prerequisite = new PrerequisiteVerifierWithRetryAdapter({
      inner: fail,
      retry: { max: 5, backoff: exponential },
    });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(5);
    expect(bunSleep).toHaveBeenNthCalledWith(1, 1);
    expect(bunSleep).toHaveBeenNthCalledWith(2, 2);
    expect(bunSleep).toHaveBeenNthCalledWith(3, 4);
    expect(bunSleep).toHaveBeenNthCalledWith(4, 8);
  });

  test("preserves kind", () => {
    const prerequisite = new PrerequisiteVerifierWithRetryAdapter({ inner: pass, retry });

    expect(prerequisite.kind).toEqual(pass.kind);
  });
});
