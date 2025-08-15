import { SendMailOptions } from "nodemailer";
import { Logger } from "./logger.service";
import { MailerPort } from "./mailer.port";
import { SmtpMailerAdapter } from "./smtp-mailer.adapter";

type MailerSendOptionsType = SendMailOptions;

type SmtpMailerWithLoggerConfigType = {
  smtpMailer: SmtpMailerAdapter;
  logger: Logger;
};

export class SmtpMailerWithLoggerAdapter implements MailerPort {
  constructor(private readonly config: SmtpMailerWithLoggerConfigType) {}

  async send(message: MailerSendOptionsType): Promise<unknown> {
    try {
      this.config.logger.info({ message: "Mailer attempt", operation: "mailer", metadata: message });

      const result = await this.config.smtpMailer.send(message);

      this.config.logger.info({
        message: "Mailer success",
        operation: "mailer",
        metadata: { message, result },
      });

      return result;
    } catch (error) {
      this.config.logger.error({
        message: "Mailer error",
        operation: "mailer",
        metadata: this.config.logger.formatError(error),
      });

      throw error;
    }
  }

  async verify() {
    return this.config.smtpMailer.verify();
  }
}
