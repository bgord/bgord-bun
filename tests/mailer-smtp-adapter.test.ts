import { describe, expect, jest, spyOn, test } from "bun:test";
import nodemailer from "nodemailer";
import {
  EmailContentHtml,
  EmailFrom,
  EmailSubject,
  EmailTo,
  MailerSmtpAdapter,
  SmtpPort,
} from "../src/mailer-smtp.adapter";

describe("MailerSmtpAdapter", () => {
  test("send - success", async () => {
    const sendMail = jest.fn();
    spyOn(nodemailer, "createTransport").mockReturnValue({ sendMail } as any);

    const mailer = new MailerSmtpAdapter({
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: SmtpPort.parse(587),
      SMTP_USER: "user@example.com",
      SMTP_PASS: "password",
    });

    const sendOptions = {
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      text: "This is a test email.",
    };

    await mailer.send(sendOptions);

    expect(sendMail).toHaveBeenCalledWith(sendOptions);
  });

  test("verify - success", async () => {
    const verify = jest.fn();
    spyOn(nodemailer, "createTransport").mockImplementation(() => ({ verify }) as any);

    const mailer = new MailerSmtpAdapter({
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: SmtpPort.parse(587),
      SMTP_USER: "user@example.com",
      SMTP_PASS: "password",
    });

    await mailer.verify();

    expect(verify).toHaveBeenCalled();
  });
});

describe("Email validators", () => {
  test("EmailSubject - valid", () => {
    expect(() => EmailSubject.parse("Welcome to our newsletter")).not.toThrow();
  });

  test("EmailSubject - too short", () => {
    expect(() => EmailSubject.parse("")).toThrow();
  });

  test("EmailSubject - too long", () => {
    const longSubject = "a".repeat(129);
    expect(() => EmailSubject.parse(longSubject)).toThrow();
  });

  test("EmailContentHtml - valid", () => {
    expect(() => EmailContentHtml.parse("<p>Hello, world!</p>")).not.toThrow();
  });

  test("EmailContentHtml - empty", () => {
    expect(() => EmailContentHtml.parse("")).toThrow();
  });

  test("EmailContentHtml - too long", () => {
    const longContent = "a".repeat(10_001);
    expect(() => EmailContentHtml.parse(longContent)).toThrow();
  });

  test("EmailFrom - valid", () => {
    expect(() => EmailFrom.parse("test@example.com")).not.toThrow();
  });

  test("EmailFrom - invalid", () => {
    expect(() => EmailFrom.parse("not-an-email")).toThrow();
  });

  test("EmailTo - valid", () => {
    expect(() => EmailTo.parse("test@example.com")).not.toThrow();
  });

  test("EmailTo - invalid", () => {
    expect(() => EmailTo.parse("not-an-email")).toThrow();
  });
});
