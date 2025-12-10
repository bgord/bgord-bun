import type { SendMailOptions } from "nodemailer";
import type { LoggerPort } from "./logger.port";
import type { MailerPort } from "./mailer.port";

type MailerSendOptionsType = SendMailOptions;

type Dependencies = { Logger: LoggerPort };

export class MailerNoopAdapter implements MailerPort {
  private readonly base = { component: "infra", operation: "mailer" };

  constructor(private readonly deps: Dependencies) {}

  async send(message: MailerSendOptionsType): Promise<unknown> {
    return this.deps.Logger.info({ message: "[NOOP] Mailer adapter", metadata: message, ...this.base });
  }

  async verify() {
    return true;
  }
}
