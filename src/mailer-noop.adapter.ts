import type { SendMailOptions } from "nodemailer";
import type { MailerPort } from "./mailer.port";

type MailerSendOptionsType = SendMailOptions;

export class MailerNoopAdapter implements MailerPort {
  async send(_message: MailerSendOptionsType): Promise<unknown> {
    return;
  }

  async verify() {
    return true;
  }
}
