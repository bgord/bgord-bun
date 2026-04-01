import type * as Nodemailer from "nodemailer";
import { DynamicImport } from "./dynamic-import.service";
import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";
import type { SmtpHostType } from "./smtp-host.vo";
import type { SmtpPassType } from "./smtp-pass.vo";
import type { SmtpPortType } from "./smtp-port.vo";
import type { SmtpUserType } from "./smtp-user.vo";

export const MailerSmtpAdapterError = {
  MissingDependency: "mailer.smtp.adapter.error.missing.dependency",
};

type Config = {
  SMTP_HOST: SmtpHostType;
  SMTP_PORT: SmtpPortType;
  SMTP_USER: SmtpUserType;
  SMTP_PASS: SmtpPassType;
};

type NodemailerLibrary = typeof Nodemailer;

export class MailerSmtpAdapter implements MailerPort {
  private static readonly importer = DynamicImport.for<NodemailerLibrary>(
    "nodemailer",
    MailerSmtpAdapterError.MissingDependency,
  );

  private constructor(private readonly transport: Nodemailer.Transporter) {}

  static async build(config: Config): Promise<MailerSmtpAdapter> {
    const library = await MailerSmtpAdapter.importer.resolve();

    return new MailerSmtpAdapter(
      library.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
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
