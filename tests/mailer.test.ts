import { describe, expect, jest, spyOn, test } from "bun:test";
import nodemailer from "nodemailer";

import {
  EmailAttachment,
  EmailContentHtml,
  EmailFrom,
  EmailSubject,
  EmailTo,
  Mailer,
  SmtpPort,
} from "../src/mailer.service";

describe("Mailer class", () => {
  test("Mailer can be instantiated with valid configuration", () => {
    const nodemailerCreateTransport = spyOn(nodemailer, "createTransport");

    const validConfig = {
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: SmtpPort.parse(587),
      SMTP_USER: "user@example.com",
      SMTP_PASS: "password",
    };

    const mailer = new Mailer(validConfig);

    expect(mailer).toBeInstanceOf(Mailer);

    nodemailerCreateTransport.mockRestore();
  });

  test("Mailer sends email using send method", async () => {
    const sendMail = jest.fn();

    const nodemailerCreateTransport = spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail,
    } as any);

    const mailer = new Mailer({
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

    nodemailerCreateTransport.mockRestore();
  });

  test("Mailer verifies the configuration using verify method", async () => {
    const verify = jest.fn();

    const nodemailerCreateTransport = spyOn(nodemailer, "createTransport").mockImplementation(
      () => ({ verify }) as any,
    );

    const mailer = new Mailer({
      SMTP_HOST: "smtp.example.com",
      SMTP_PORT: SmtpPort.parse(587),
      SMTP_USER: "user@example.com",
      SMTP_PASS: "password",
    });

    await mailer.verify();

    expect(verify).toHaveBeenCalled();

    nodemailerCreateTransport.mockRestore();
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

  test("EmailAttachment - valid", () => {
    expect(() => EmailAttachment.parse({ filename: "file.pdf", path: "/tmp/file.pdf" })).not.toThrow();
  });

  test("EmailAttachment - missing filename", () => {
    expect(() => EmailAttachment.parse({ path: "/tmp/file.pdf" })).toThrow();
  });

  test("EmailAttachment - empty path", () => {
    expect(() => EmailAttachment.parse({ filename: "file.pdf", path: "" })).toThrow();
  });
});
