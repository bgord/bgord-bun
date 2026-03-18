import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import * as v from "valibot";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";
import { MailerWithTimeoutAdapter } from "../src/mailer-with-timeout.adapter";
import { TimeoutRunnerBareAdapter } from "../src/timeout-runner-bare.adapter";
import { TimeoutRunnerNoopAdapter } from "../src/timeout-runner-noop.adapter";
import * as mocks from "./mocks";

const TimeoutRunner = new TimeoutRunnerNoopAdapter();

const timeout = tools.Duration.Ms(1);
const over = timeout.times(v.parse(tools.MultiplicationFactor, 2));

const inner = new MailerNoopAdapter();
const mailer = new MailerWithTimeoutAdapter({ timeout }, { inner, TimeoutRunner });

describe("MailerWithTimeoutAdapter", () => {
  test("send - success", async () => {
    expect(async () => mailer.send(mocks.template)).not.toThrow();
  });

  test("send - failure", async () => {
    using _ = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalError);

    expect(async () => mailer.send(mocks.template)).toThrow(mocks.IntentionalError);
  });

  test("send - timeout", async () => {
    jest.useFakeTimers();
    using _ = spyOn(inner, "send").mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, over.ms)),
    );
    const TimeoutRunner = new TimeoutRunnerBareAdapter();
    const mailer = new MailerWithTimeoutAdapter({ timeout }, { inner, TimeoutRunner });

    const result = mailer.send(mocks.template);
    jest.runAllTimers();

    expect(result).rejects.toThrow("timeout.exceeded");

    jest.useRealTimers();
  });

  test("verify", async () => {
    expect(await mailer.verify()).toEqual(true);
  });
});
