import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";

export class MailerNoopAdapter implements MailerPort {
  async send(_template: MailerTemplate): Promise<unknown> {
    return;
  }

  async verify() {
    return true;
  }
}
