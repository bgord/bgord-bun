import { describe, expect, jest, spyOn, test } from "bun:test";
import nodemailer from "nodemailer";
import { EmailContentHtml, EmailFrom, EmailSubject, EmailTo, SmtpPort } from "../src/mailer.vo";
import { MailerSmtpAdapter } from "../src/mailer-smtp.adapter";

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
  test("EmailSubject - happy path", () => {
    expect(EmailSubject.safeParse("Welcome to our newsletter").success).toEqual(true);
  });

  test("EmailSubject - empty", () => {
    expect(() => EmailSubject.parse("")).toThrow();
  });

  test("EmailSubject - too long", () => {
    expect(() => EmailSubject.parse("a".repeat(129))).toThrow();
  });

  test("EmailContentHtml - happy path", () => {
    expect(EmailContentHtml.safeParse("<p>Hello, world!</p>").success).toEqual(true);
  });

  test("EmailContentHtml - empty", () => {
    expect(() => EmailContentHtml.parse("")).toThrow();
  });

  test("EmailContentHtml - too long", () => {
    expect(() => EmailContentHtml.parse("a".repeat(10_001))).toThrow();
  });

  test("EmailFrom - happy path", () => {
    expect(EmailFrom.safeParse("test@example.com").success).toEqual(true);
  });

  test("EmailFrom - invalid", () => {
    expect(() => EmailFrom.parse("not-an-email")).toThrow();
  });

  test("EmailTo - happy path", () => {
    expect(EmailTo.safeParse("test@example.com").success).toEqual(true);
  });

  test("EmailTo - invalid", () => {
    expect(() => EmailTo.parse("not-an-email")).toThrow();
  });
});
