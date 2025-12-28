import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { PrerequisiteVerifierWithRetryAdapter } from "../src/prerequisite-verifier-with-retry.adapter";
import { RetryBackoffExponentialStrategy } from "../src/retry-backoff-exponential.strategy";
import { RetryBackoffNoopStrategy } from "../src/retry-backoff-noop.strategy";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import * as mocks from "./mocks";

const max = 3;
const backoff = new RetryBackoffNoopStrategy();
const base = tools.Duration.Ms(1);
const exponential = new RetryBackoffExponentialStrategy(base);
const retry = { max, backoff };

const pass = new mocks.PrerequisiteVerifierPass();
const fail = new mocks.PrerequisiteVerifierFail();
const failThenPass = new mocks.PrerequisiteVerifierFailThenPass();

describe("PrerequisiteVerifierWithRetryAdapter", () => {
  test("success", async () => {
    const Sleeper = new SleeperNoopAdapter();

    const prerequisite = new PrerequisiteVerifierWithRetryAdapter({ inner: pass, retry }, { Sleeper });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
  });

  test("failure", async () => {
    const Sleeper = new SleeperNoopAdapter();
    const failVerify = spyOn(fail, "verify");
    const sleeperWait = spyOn(Sleeper, "wait");
    const prerequisite = new PrerequisiteVerifierWithRetryAdapter({ inner: fail, retry }, { Sleeper });

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(3);
    expect(sleeperWait).toHaveBeenCalledTimes(2);
  });

  test("failure then success", async () => {
    const Sleeper = new SleeperNoopAdapter();
    const failThenPassVerify = spyOn(failThenPass, "verify");
    const sleeperWait = spyOn(Sleeper, "wait");
    const prerequisite = new PrerequisiteVerifierWithRetryAdapter(
      { inner: failThenPass, retry },
      { Sleeper },
    );

    expect(await prerequisite.verify()).toEqual(mocks.VerificationSuccess);
    expect(failThenPassVerify).toHaveBeenCalledTimes(3);
    expect(sleeperWait).toHaveBeenCalledTimes(2);
  });

  test("exponential backoff", async () => {
    const fail = new mocks.PrerequisiteVerifierFail();
    const Sleeper = new SleeperNoopAdapter();
    const failVerify = spyOn(fail, "verify");
    const sleeperWait = spyOn(Sleeper, "wait");
    const prerequisite = new PrerequisiteVerifierWithRetryAdapter(
      { inner: fail, retry: { max: 5, backoff: exponential } },
      { Sleeper },
    );

    expect(await prerequisite.verify()).toEqual(mocks.VerificationFailure(mocks.IntentionalError));
    expect(failVerify).toHaveBeenCalledTimes(5);
    expect(sleeperWait).toHaveBeenNthCalledWith(1, base.times(tools.MultiplicationFactor.parse(1)));
    expect(sleeperWait).toHaveBeenNthCalledWith(2, base.times(tools.MultiplicationFactor.parse(2)));
    expect(sleeperWait).toHaveBeenNthCalledWith(3, base.times(tools.MultiplicationFactor.parse(4)));
    expect(sleeperWait).toHaveBeenNthCalledWith(4, base.times(tools.MultiplicationFactor.parse(8)));
  });

  test("preserves kind", () => {
    const Sleeper = new SleeperNoopAdapter();
    const prerequisite = new PrerequisiteVerifierWithRetryAdapter({ inner: pass, retry }, { Sleeper });

    expect(prerequisite.kind).toEqual(pass.kind);
  });
});
