import nodemailer, { type SendMailOptions } from "nodemailer";
import type { MailerPort } from "./mailer.port";
import type { SmtpHostType, SmtpPassType, SmtpPortType, SmtpUserType } from "./mailer.vo";

type MailerConfigType = {
  SMTP_HOST: SmtpHostType;
  SMTP_PORT: SmtpPortType;
  SMTP_USER: SmtpUserType;
  SMTP_PASS: SmtpPassType;
};

export class MailerSmtpAdapter implements MailerPort {
  private readonly transport: nodemailer.Transporter;

  constructor(config: MailerConfigType) {
    this.transport = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
    });
  }

  async send(message: SendMailOptions): Promise<unknown> {
    return this.transport.sendMail(message);
  }

  async verify() {
    return this.transport.verify();
  }
}
