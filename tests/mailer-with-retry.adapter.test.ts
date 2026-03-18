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
const mailer = new MailerWithRetryAdapter({ retry }, { inner, Sleeper });

describe("MailerWithRetryAdapter", () => {
  test("send - success", async () => {
    expect(async () => mailer.send(mocks.template)).not.toThrow();
  });

  test("send - retry", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    using _ = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalError);

    expect(async () => mailer.send(mocks.template)).toThrow(mocks.IntentionalError);
    expect(sleeperWait).toHaveBeenCalledTimes(2);
  });

  test("send - recovery", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    using _ = spyOn(inner, "send").mockImplementationOnce(mocks.throwIntentionalError);

    expect(async () => mailer.send(mocks.template)).not.toThrow();
    expect(sleeperWait).toHaveBeenCalledTimes(1);
  });

  test("verify", async () => {
    expect(await mailer.verify()).toEqual(true);
  });
});
