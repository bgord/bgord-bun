import { Resend } from "resend";
import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";

type MailerConfigType = { key: string };

export class MailerResendAdapter implements MailerPort {
  readonly transport;

  constructor(config: MailerConfigType) {
    this.transport = new Resend(config.key);
  }

  async send(message: MailerTemplate): Promise<unknown> {
    const result = await this.transport.emails.send({ ...message.config, ...message.template.get() });

    if (!result.error) return result;

    const error = new Error(result.error.message);
    error.name = result.error.name;

    throw error;
  }

  async verify() {
    return true;
  }
}
