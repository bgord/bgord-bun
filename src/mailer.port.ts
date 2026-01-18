import type { MailerTemplate } from "./mailer-template.vo";

export interface MailerPort {
  send(message: MailerTemplate): Promise<unknown>;
  verify(): Promise<boolean>;
}
