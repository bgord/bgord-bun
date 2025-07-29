import type { SendMailOptions } from "nodemailer";

export interface MailerPort {
  send(message: SendMailOptions): Promise<unknown>;

  verify(): Promise<boolean>;
}
