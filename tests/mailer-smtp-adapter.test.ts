import { describe, expect, jest, spyOn, test } from "bun:test";
import nodemailer from "nodemailer";
import { MailerSmtpAdapter } from "../src/mailer-smtp.adapter";
import { SmtpHost } from "../src/smtp-host.vo";
import { SmtpPass } from "../src/smtp-pass.vo";
import { SmtpPort } from "../src/smtp-port.vo";
import { SmtpUser } from "../src/smtp-user.vo";

const smtp = {
  SMTP_HOST: SmtpHost.parse("smtp.example.com"),
  SMTP_PORT: SmtpPort.parse(587),
  SMTP_USER: SmtpUser.parse("user@example.com"),
  SMTP_PASS: SmtpPass.parse("password"),
};

describe("MailerSmtpAdapter", () => {
  test("send - success", async () => {
    const sendMail = jest.fn();
    const nodemailerCreateTransport = spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail,
    } as any);
    const mailer = new MailerSmtpAdapter(smtp);
    const sendOptions = {
      from: "sender@example.com",
      to: "recipient@example.com",
      subject: "Test Email",
      text: "This is a test email.",
    };

    await mailer.send(sendOptions);

    expect(sendMail).toHaveBeenCalledWith(sendOptions);
    expect(nodemailerCreateTransport).toHaveBeenCalledWith({
      auth: { user: smtp.SMTP_USER, pass: smtp.SMTP_PASS },
      host: smtp.SMTP_HOST,
      port: smtp.SMTP_PORT,
    });
  });

  test("verify - success", async () => {
    const verify = jest.fn();
    spyOn(nodemailer, "createTransport").mockImplementation(() => ({ verify }) as any);
    const mailer = new MailerSmtpAdapter(smtp);

    await mailer.verify();

    expect(verify).toHaveBeenCalled();
  });
});
