import type { MailerTemplate } from "./mailer-template.vo";

export interface MailerPort {
  send(template: MailerTemplate): Promise<void>;
  verify(): Promise<boolean>;
}
