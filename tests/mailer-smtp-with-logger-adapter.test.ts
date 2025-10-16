import { describe, expect, jest, spyOn, test } from "bun:test";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SmtpPort } from "../src/mailer.vo";
import { MailerSmtpAdapter } from "../src/mailer-smtp.adapter";
import { MailerSmtpWithLoggerAdapter } from "../src/mailer-smtp-with-logger.adapter";

const logger = new LoggerNoopAdapter();

const smtpMailer = new MailerSmtpAdapter({
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: SmtpPort.parse(587),
  SMTP_USER: "user@example.com",
  SMTP_PASS: "password",
});

const mailer = new MailerSmtpWithLoggerAdapter({ logger, smtpMailer });

describe("SmtpMailerWithLoggerAdapter", () => {
  test("send - success", async () => {
    const sendMail = spyOn(smtpMailer, "send").mockImplementation(jest.fn());
    const loggerInfo = spyOn(logger, "info");

    const sendOptions = {
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      text: "This is a test email.",
    };

    await mailer.send(sendOptions);

    expect(sendMail).toHaveBeenCalledWith(sendOptions);
    expect(loggerInfo).toHaveBeenCalledTimes(2);
  });
});
