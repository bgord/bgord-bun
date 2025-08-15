import { describe, expect, jest, spyOn, test } from "bun:test";
import nodemailer from "nodemailer";
import { Logger } from "../src/logger.service";
import { SmtpMailerAdapter, SmtpPort } from "../src/smtp-mailer.adapter";
import { SmtpMailerWithLoggerAdapter } from "../src/smtp-mailer-with-mailer.adapter";

class FakeLogger {
  info = (_: any) => {};
  error = (_: any) => {};
  formatError(_: any) {
    return "formatted_error";
  }
}

const logger = new FakeLogger() as unknown as Logger;

const smtpMailer = new SmtpMailerAdapter({
  SMTP_HOST: "smtp.example.com",
  SMTP_PORT: SmtpPort.parse(587),
  SMTP_USER: "user@example.com",
  SMTP_PASS: "password",
});

const mailer = new SmtpMailerWithLoggerAdapter({ logger, smtpMailer });

describe("SmtpMailerWithLogger class", () => {
  test("Mailer can be instantiated with valid configuration", () => {
    const nodemailerCreateTransport = spyOn(nodemailer, "createTransport");

    expect(mailer).toBeInstanceOf(SmtpMailerWithLoggerAdapter);

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
