import { describe, expect, jest, spyOn, test } from "bun:test";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SmtpHost, SmtpPass, SmtpPort, SmtpUser } from "../src/mailer.vo";
import { MailerSmtpAdapter } from "../src/mailer-smtp.adapter";
import { MailerSmtpWithLoggerAdapter } from "../src/mailer-smtp-with-logger.adapter";
import * as mocks from "./mocks";

const Logger = new LoggerNoopAdapter();
const MailerSmtp = new MailerSmtpAdapter({
  SMTP_HOST: SmtpHost.parse("smtp.example.com"),
  SMTP_PORT: SmtpPort.parse(587),
  SMTP_USER: SmtpUser.parse("user@example.com"),
  SMTP_PASS: SmtpPass.parse("password"),
});
const deps = { Logger, MailerSmtp };

const mailer = new MailerSmtpWithLoggerAdapter(deps);

describe("SmtpMailerWithLoggerAdapter", () => {
  test("send - success", async () => {
    const sendMail = spyOn(MailerSmtp, "send").mockImplementation(jest.fn());
    const loggerInfo = spyOn(Logger, "info");
    const sendOptions = {
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      text: "This is a test email.",
    };

    await mailer.send(sendOptions);

    expect(sendMail).toHaveBeenCalledWith(sendOptions);
    expect(loggerInfo).toHaveBeenNthCalledWith(1, {
      component: "infra",
      message: "Mailer attempt",
      metadata: sendOptions,
      operation: "mailer",
    });
    expect(loggerInfo).toHaveBeenNthCalledWith(2, {
      component: "infra",
      message: "Mailer success",
      metadata: { message: sendOptions },
      operation: "mailer",
    });
  });

  test("failure", async () => {
    const sendMail = spyOn(MailerSmtp, "send").mockImplementation(mocks.throwIntentionalError);
    const loggerError = spyOn(Logger, "error");
    const sendOptions = {
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      text: "This is a test email.",
    };

    expect(async () => mailer.send(sendOptions)).toThrow(mocks.IntentionalError);
    expect(sendMail).toHaveBeenCalledWith(sendOptions);
    expect(loggerError).toHaveBeenCalledWith(
      expect.objectContaining({ component: "infra", message: "Mailer error", operation: "mailer" }),
    );
  });

  test("verfiy", async () => {
    const mailerSmtpVerify = spyOn(MailerSmtp, "verify").mockImplementation(jest.fn());

    await mailer.verify();

    expect(mailerSmtpVerify).toHaveBeenCalled();
  });
});
