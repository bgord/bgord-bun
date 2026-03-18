import { describe, expect, jest, spyOn, test } from "bun:test";
import * as tools from "@bgord/tools";
import { ClockFixedAdapter } from "../src/clock-fixed.adapter";
import { LoggerCollectingAdapter } from "../src/logger-collecting.adapter";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";
import { MailerWithLoggerAdapter } from "../src/mailer-with-logger.adapter";
import * as mocks from "./mocks";

const Clock = new ClockFixedAdapter(mocks.TIME_ZERO);

const inner = new MailerNoopAdapter();

describe("MailerWithLoggerAdapter", async () => {
  test("send - success", async () => {
    using sendMail = spyOn(inner, "send").mockImplementation(jest.fn());
    const Logger = new LoggerCollectingAdapter();
    const adapter = new MailerWithLoggerAdapter({ Logger, Clock, inner });

    await adapter.send(mocks.template);

    expect(sendMail).toHaveBeenCalledWith(mocks.template);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: "Mailer attempt",
        metadata: mocks.template.toJSON(),
        operation: "mailer",
      },
      {
        component: "infra",
        message: "Mailer success",
        metadata: { template: mocks.template.toJSON(), duration: expect.any(tools.Duration) },
        operation: "mailer",
      },
    ]);
  });

  test("failure", async () => {
    using sendMail = spyOn(inner, "send").mockImplementation(mocks.throwIntentionalError);
    const Logger = new LoggerCollectingAdapter();
    const adapter = new MailerWithLoggerAdapter({ Logger, Clock, inner });

    expect(async () => adapter.send(mocks.template)).toThrow(mocks.IntentionalError);
    expect(sendMail).toHaveBeenCalledWith(mocks.template);
    expect(Logger.entries).toEqual([
      {
        component: "infra",
        message: "Mailer attempt",
        metadata: mocks.template.toJSON(),
        operation: "mailer",
      },
      {
        component: "infra",
        message: "Mailer error",
        operation: "mailer",
        error: new Error(mocks.IntentionalError),
        metadata: expect.any(tools.Duration),
      },
    ]);
  });

  test("verfiy", async () => {
    using mailerSmtpVerify = spyOn(inner, "verify").mockImplementation(jest.fn());
    const Logger = new LoggerCollectingAdapter();
    const adapter = new MailerWithLoggerAdapter({ Logger, Clock, inner });

    await adapter.verify();

    expect(mailerSmtpVerify).toHaveBeenCalled();
  });
});
