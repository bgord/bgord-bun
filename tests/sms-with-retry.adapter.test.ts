import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { RetryBackoffNoopStrategy } from "../src/retry-backoff-noop.strategy";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import { SmsNoopAdapter } from "../src/sms-noop.adapter";
import { SmsWithRetryAdapter } from "../src/sms-with-retry.adapter";
import * as mocks from "./mocks";

const max = tools.Int.positive(3);
const backoff = new RetryBackoffNoopStrategy();
const retry = { max, backoff };

const Sleeper = new SleeperNoopAdapter();
const inner = new SmsNoopAdapter();
const adapter = new SmsWithRetryAdapter({ retry }, { inner, Sleeper });

describe("SmsWithRetryAdapter", () => {
  test("send - success", async () => {
    expect(async () => adapter.send(mocks.sms)).not.toThrow();
  });

  test("send - retry", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    using _ = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalError);

    expect(async () => adapter.send(mocks.sms)).toThrow(mocks.IntentionalError);
    expect(sleeperWait).toHaveBeenCalledTimes(2);
  });

  test("send - recovery", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    using _ = spyOn(inner, "send").mockImplementationOnce(mocks.throwIntentionalError);

    expect(async () => adapter.send(mocks.sms)).not.toThrow();
    expect(sleeperWait).toHaveBeenCalledTimes(1);
  });

  test("verify", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
