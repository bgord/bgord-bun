import { describe, expect, jest, spyOn, test } from "bun:test";
import nodemailer from "nodemailer";
import type { Logger } from "../src/logger.service";
import { MailerSmtpAdapter, SmtpPort } from "../src/mailer-smtp.adapter";
import { MailerSmtpWithLoggerAdapter } from "../src/mailer-smtp-with-logger.adapter";

class FakeLogger {
  info = (_: any) => {};
  error = (_: any) => {};
  formatError(_: any) {
    return "formatted_error";
  }
}

const logger = new FakeLogger() as unknown as Logger;

const smtpMailer = new MailerSmtpAdapter({
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: SmtpPort.parse(587),
  SMTP_USER: "user@example.com",
  SMTP_PASS: "password",
});

const mailer = new MailerSmtpWithLoggerAdapter({ logger, smtpMailer });

describe("SmtpMailerWithLogger class", () => {
  test("Mailer can be instantiated with valid configuration", () => {
    const nodemailerCreateTransport = spyOn(nodemailer, "createTransport");

    expect(mailer).toBeInstanceOf(MailerSmtpWithLoggerAdapter);

    nodemailerCreateTransport.mockRestore();
  });

  test("Mailer sends email using send method - success", async () => {
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

  test("Mailer sends email using send method - success", async () => {
    const sendMail = spyOn(smtpMailer, "send").mockImplementation(() => {
      throw new Error("FAILURE");
    });
    const loggerInfo = spyOn(logger, "info");
    const loggerError = spyOn(logger, "error");

    const sendOptions = {
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      text: "This is a test email.",
    };

    expect(async () => mailer.send(sendOptions)).toThrow();

    expect(sendMail).toHaveBeenCalledWith(sendOptions);
    expect(loggerInfo).toHaveBeenCalled();
    expect(loggerError).toHaveBeenCalled();
  });
});
