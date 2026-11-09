import type * as Nodemailer from "nodemailer";
import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";
import type { SmtpHostType } from "./smtp-host.vo";
import type { SmtpPassType } from "./smtp-pass.vo";
import type { SmtpPortType } from "./smtp-port.vo";
import type { SmtpUserType } from "./smtp-user.vo";

type Config = {
  SMTP_HOST: SmtpHostType;
  SMTP_PORT: SmtpPortType;
  SMTP_USER: SmtpUserType;
  SMTP_PASS: SmtpPassType;
};

type Dependencies = { Nodemailer: typeof Nodemailer };

export class MailerSmtpAdapter implements MailerPort {
  private constructor(private readonly transport: Nodemailer.Transporter) {}

  static build(config: Config, deps: Dependencies): MailerSmtpAdapter {
    return new MailerSmtpAdapter(
      deps.Nodemailer.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
        requireTLS: true,
      }),
    );
  }

  async send(template: MailerTemplate): Promise<void> {
    await this.transport.sendMail({
      ...template.config,
      ...template.message,
      attachments: template.attachments,
    });
  }

  async verify(): Promise<boolean> {
    return this.transport.verify();
  }
}
