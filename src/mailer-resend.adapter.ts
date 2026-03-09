import type { Resend } from "resend";
import { DynamicImport } from "./dynamic-import.service";
import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";

export const MailerResendAdapterError = {
  MissingDependency: "mailer.resend.adapter.error.missing.dependency",
};

type Config = { key: string };
type ResendLibrary = typeof import("resend");

export class MailerResendAdapter implements MailerPort {
  private static readonly importer = DynamicImport.for<ResendLibrary>(
    "resend",
    MailerResendAdapterError.MissingDependency,
  );

  private constructor(readonly transport: Resend) {}

  static async build(config: Config): Promise<MailerResendAdapter> {
    const library = await MailerResendAdapter.importer.resolve();

    return new MailerResendAdapter(new library.Resend(config.key));
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
