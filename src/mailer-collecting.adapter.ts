import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";

export class MailerCollectingAdapter implements MailerPort {
  messages: Array<MailerTemplate> = [];

  async send(template: MailerTemplate): Promise<void> {
    this.messages.push(template);
  }

  async verify(): Promise<boolean> {
    return true;
  }
}
