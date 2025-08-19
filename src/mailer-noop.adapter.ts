import { SendMailOptions } from "nodemailer";
import { Logger } from "./logger.service";
import { MailerPort } from "./mailer.port";

type MailerSendOptionsType = SendMailOptions;

export class MailerNoopAdapter implements MailerPort {
  constructor(private readonly logger: Logger) {}

  async send(message: MailerSendOptionsType): Promise<unknown> {
    return this.logger.info({ message: "[NOOP] Mailer adapter", operation: "write", metadata: message });
  }

  async verify() {
    return true;
  }
}
