import { describe, expect, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { MailerContentHtml } from "../src/mailer-content-html.vo";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";
import { MailerSubject } from "../src/mailer-subject.vo";
import { MailerTemplate } from "../src/mailer-template.vo";
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

const config = {
  from: v.parse(tools.Email, "sender@example.com"),
  to: v.parse(tools.Email, "recipient@example.com"),
};
const message = {
  subject: v.parse(MailerSubject, "Test Email"),
  html: v.parse(MailerContentHtml, "This is a test email."),
};
const template = new MailerTemplate(config, message);

describe("MailerWithRetryAdapter", () => {
  test("send - success", async () => {
    expect(async () => mailer.send(template)).not.toThrow();
  });

  test("send - retry", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    using _ = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalError);

    expect(async () => mailer.send(template)).toThrow(mocks.IntentionalError);
    expect(sleeperWait).toHaveBeenCalledTimes(2);
  });

  test("send - recovery", async () => {
    using sleeperWait = spyOn(Sleeper, "wait");
    using _ = spyOn(inner, "send").mockImplementationOnce(mocks.throwIntentionalError);

    expect(async () => mailer.send(template)).not.toThrow();
    expect(sleeperWait).toHaveBeenCalledTimes(1);
  });

  test("verify", async () => {
    expect(await mailer.verify()).toEqual(true);
  });
});
