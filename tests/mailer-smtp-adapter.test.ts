import { describe, expect, jest, spyOn, test } from "bun:test";
import nodemailer from "nodemailer";
import { SmtpPort } from "../src/mailer.vo";
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
