import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";

export class MailerNoopAdapter implements MailerPort {
  // Stryker disable all
  async send(_template: MailerTemplate): Promise<unknown> {
    return;
  }
  // Stryker restore all

  async verify(): Promise<boolean> {
    return true;
  }
}
