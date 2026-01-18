import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";

export class MailerNoopAdapter implements MailerPort {
  async send(_message: MailerTemplate): Promise<unknown> {
    return;
  }

  async verify() {
    return true;
  }
}
