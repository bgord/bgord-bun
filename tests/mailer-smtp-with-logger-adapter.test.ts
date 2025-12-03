import { describe, expect, jest, spyOn, test } from "bun:test";
import { LoggerNoopAdapter } from "../src/logger-noop.adapter";
import { SmtpPort } from "../src/mailer.vo";
import { MailerSmtpAdapter } from "../src/mailer-smtp.adapter";
import { MailerSmtpWithLoggerAdapter } from "../src/mailer-smtp-with-logger.adapter";

const Logger = new LoggerNoopAdapter();

const MailerSmtp = new MailerSmtpAdapter({
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: SmtpPort.parse(587),
  SMTP_USER: "user@example.com",
  SMTP_PASS: "password",
});

const mailer = new MailerSmtpWithLoggerAdapter({ Logger, MailerSmtp });

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
    expect(loggerInfo).toHaveBeenCalledTimes(2);
  });
});
