import type { SendMailOptions } from "nodemailer";
import type { LoggerPort } from "./logger.port";
import { formatError } from "./logger-format-error.service";
import type { MailerPort } from "./mailer.port";
import type { MailerSmtpAdapter } from "./mailer-smtp.adapter";

type MailerSendOptionsType = SendMailOptions;

type Dependencies = { MailerSmtp: MailerSmtpAdapter; Logger: LoggerPort };

export class MailerSmtpWithLoggerAdapter implements MailerPort {
  private readonly base = { component: "infra", operation: "mailer" };

  constructor(private readonly deps: Dependencies) {}

  async send(message: MailerSendOptionsType): Promise<unknown> {
    try {
      this.deps.Logger.info({ message: "Mailer attempt", metadata: message, ...this.base });
      const result = await this.deps.MailerSmtp.send(message);
      this.deps.Logger.info({ message: "Mailer success", metadata: { message, result }, ...this.base });

      return result;
    } catch (error) {
      this.deps.Logger.error({ message: "Mailer error", error: formatError(error), ...this.base });

      throw error;
    }
  }

  async verify() {
    return this.deps.MailerSmtp.verify();
  }
}
