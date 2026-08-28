import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";
import { MailerWithRetryAdapter } from "../src/mailer-with-retry.adapter";
import { RetryBackoffNoopStrategy } from "../src/retry-backoff-noop.strategy";
import { SleeperNoopAdapter } from "../src/sleeper-noop.adapter";
import * as mocks from "./mocks";

const max = tools.Int.positive(3);
const backoff = new RetryBackoffNoopStrategy();
const retry = { max, backoff };

const Sleeper = new SleeperNoopAdapter();

const inner = new MailerNoopAdapter();
const adapter = new MailerWithRetryAdapter({ retry }, { inner, Sleeper });

describe("MailerWithRetryAdapter", () => {
  test("send - success", async () => {
    expect(async () => adapter.send(mocks.template)).not.toThrow();
  });

  test("send - retry", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    using innerSend = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalError);

    expect(async () => adapter.send(mocks.template)).toThrow(mocks.IntentionalError);
    expect(innerSend).toHaveBeenCalledTimes(3);
    expect(sleeperWait).toHaveBeenCalledTimes(2);
  });

  test("send - recovery", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    using innerSend = spyOn(inner, "send").mockImplementationOnce(mocks.throwIntentionalError);

    expect(async () => adapter.send(mocks.template)).not.toThrow();
    expect(innerSend).toHaveBeenCalledTimes(2);
    expect(sleeperWait).toHaveBeenCalledTimes(1);
  });

  test("verify", async () => {
    expect(await adapter.verify()).toEqual(true);
  });
});
