import type { MailerTemplate } from "./mailer-template.vo";

export interface MailerPort {
  send(template: MailerTemplate): Promise<unknown>;
  verify(): Promise<boolean>;
}
