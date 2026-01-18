import nodemailer from "nodemailer";
import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";
import type { SmtpHostType } from "./smtp-host.vo";
import type { SmtpPassType } from "./smtp-pass.vo";
import type { SmtpPortType } from "./smtp-port.vo";
import type { SmtpUserType } from "./smtp-user.vo";

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

  async send(message: MailerTemplate): Promise<unknown> {
    return this.transport.sendMail({
      from: message.config.from,
      to: message.config.to,
      ...message.template.get(),
    });
  }

  async verify() {
    return this.transport.verify();
  }
}
