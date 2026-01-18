import type nodemailer from "nodemailer";
import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";
import type { SmtpHostType } from "./smtp-host.vo";
import type { SmtpPassType } from "./smtp-pass.vo";
import type { SmtpPortType } from "./smtp-port.vo";
import type { SmtpUserType } from "./smtp-user.vo";

export const MailerSmtpAdapterError = {
  MissingDependency: "mailer.smtp.adapter.error.missing.dependency",
};

type MailerConfigType = {
  SMTP_HOST: SmtpHostType;
  SMTP_PORT: SmtpPortType;
  SMTP_USER: SmtpUserType;
  SMTP_PASS: SmtpPassType;
};

export class MailerSmtpAdapter implements MailerPort {
  private constructor(readonly transport: nodemailer.Transporter) {}

  static async build(config: MailerConfigType): Promise<MailerSmtpAdapter> {
    const library = await MailerSmtpAdapter.resolve();

    return new MailerSmtpAdapter(
      library.createTransport({
        host: config.SMTP_HOST,
        port: config.SMTP_PORT,
        auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
      }),
    );
  }

  private static async resolve() {
    try {
      const library = await MailerSmtpAdapter.import();

      return library;
    } catch {
      throw new Error(MailerSmtpAdapterError.MissingDependency);
    }
  }

  static async import() {
    const name = "nodem" + "ailer"; // Bun does not resolve dynamic imports with a dynamic name
    return import(name);
  }

  async send(template: MailerTemplate): Promise<unknown> {
    return this.transport.sendMail({
      ...template.config,
      ...template.template.get(),
      attachments: template.attachments,
    });
  }

  async verify() {
    return this.transport.verify();
  }
}
