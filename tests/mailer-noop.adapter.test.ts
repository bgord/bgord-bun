import { describe, expect, spyOn, test } from "bun:test";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { MailerNoopAdapter } from "../src/mailer-noop.adapter";

const Logger = new LoggerNoopAdapter();
const mailer = new MailerNoopAdapter({ Logger });

describe("MailerNoopAdapter", () => {
  test("send - success", async () => {
    const loggerInfo = spyOn(Logger, "info");
    const sendOptions = {
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      text: "This is a test email.",
    };

    await mailer.send(sendOptions);

    expect(loggerInfo).toHaveBeenCalledTimes(1);
  });

  test("verify", async () => {
    expect(await mailer.verify()).toEqual(true);
  });
});
