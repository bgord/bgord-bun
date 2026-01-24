import type { Resend } from "resend";
import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";

export const MailerResendAdapterError = {
  MissingDependency: "mailer.resend.adapter.error.missing.dependency",
};

type MailerConfigType = { key: string };

export class MailerResendAdapter implements MailerPort {
  readonly transport: Resend;

  private constructor(mailer: Resend) {
    this.transport = mailer;
  }

  static async build(config: MailerConfigType): Promise<MailerResendAdapter> {
    const library = await MailerResendAdapter.resolve();

    return new MailerResendAdapter(new library(config.key));
  }

  private static async resolve() {
    try {
      const library = await MailerResendAdapter.import();

      return library.Resend;
    } catch {
      throw new Error(MailerResendAdapterError.MissingDependency);
    }
  }

  static async import() {
    const name = "res" + "end"; // Bun does not resolve dynamic imports with a dynamic name
    return import(name);
  }

  async send(template: MailerTemplate): Promise<void> {
    const result = await this.transport.emails.send({
      ...template.config,
      ...template.message,
      attachments: template.attachments,
    });

    if (!result.error) return;

    const error = new Error(result.error.message);
    error.name = result.error.name;

    throw error;
  }

  async verify(): Promise<boolean> {
    return true;
  }
}
