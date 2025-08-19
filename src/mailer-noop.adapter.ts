import type { SendMailOptions } from "nodemailer";
import type { Logger } from "./logger.service";
import type { MailerPort } from "./mailer.port";

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
