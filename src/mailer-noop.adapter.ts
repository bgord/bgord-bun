import type { SendMailOptions } from "nodemailer";
import type { LoggerPort } from "./logger.port";
import type { MailerPort } from "./mailer.port";

type MailerSendOptionsType = SendMailOptions;

export class MailerNoopAdapter implements MailerPort {
  constructor(private readonly logger: LoggerPort) {}

  async send(message: MailerSendOptionsType): Promise<unknown> {
    return this.logger.info({
      message: "[NOOP] Mailer adapter",
      component: "mailer",
      operation: "write",
      metadata: message,
    });
  }

  async verify() {
    return true;
  }
}
