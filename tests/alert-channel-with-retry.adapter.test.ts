import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { AlertChannelNoopAdapter } from "../src/alert-channel-noop.adapter";
import { AlertChannelWithRetryAdapter } from "../src/alert-channel-with-retry.adapter";
import { RetryBackoffNoopStrategy } from "../src/retry-backoff-noop.strategy";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import * as mocks from "./mocks";

const max = tools.Int.positive(3);
const backoff = new RetryBackoffNoopStrategy();
const retry = { max, backoff };

const Sleeper = new SleeperNoopAdapter();

const inner = new AlertChannelNoopAdapter();
const adapter = new AlertChannelWithRetryAdapter({ retry }, { inner, Sleeper });

describe("AlertChannelWithRetryAdapter", () => {
  test("send - success", async () => {
    expect(async () => adapter.send(mocks.alert)).not.toThrow();
  });

  test("send - retry", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    using _ = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalError);

    expect(async () => adapter.send(mocks.alert)).toThrow(mocks.IntentionalError);
    expect(sleeperWait).toHaveBeenCalledTimes(2);
  });

  test("send - recovery", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    using _ = spyOn(inner, "send").mockImplementationOnce(mocks.throwIntentionalError);

    expect(async () => adapter.send(mocks.alert)).not.toThrow();
    expect(sleeperWait).toHaveBeenCalledTimes(1);
  });

  test("verify", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
