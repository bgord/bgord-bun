import type { SendMailOptions } from "nodemailer";
import type { LoggerPort } from "./logger.port";
import { formatError } from "./logger-format-error.service";
import type { MailerPort } from "./mailer.port";
import type { MailerSmtpAdapter } from "./mailer-smtp.adapter";

type MailerSendOptionsType = SendMailOptions;
type SmtpMailerWithLoggerConfigType = { smtpMailer: MailerSmtpAdapter; logger: LoggerPort };

export class MailerSmtpWithLoggerAdapter implements MailerPort {
  private readonly base = { component: "infra", operation: "mailer" };

  constructor(private readonly config: SmtpMailerWithLoggerConfigType) {}

  async send(message: MailerSendOptionsType): Promise<unknown> {
    try {
      this.config.logger.info({ message: "Mailer attempt", metadata: message, ...this.base });
      const result = await this.config.smtpMailer.send(message);
      this.config.logger.info({ message: "Mailer success", metadata: { message, result }, ...this.base });
      return result;
    } catch (error) {
      this.config.logger.error({ message: "Mailer error", error: formatError(error), ...this.base });
      throw error;
    }
  }

  async verify() {
    return this.config.smtpMailer.verify();
  }
}
