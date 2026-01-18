import type { LoggerPort } from "./logger.port";
import { formatError } from "./logger-format-error.service";
import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";

type Dependencies = { inner: MailerPort; Logger: LoggerPort };

export class MailerWithLoggerAdapter implements MailerPort {
  private readonly base = { component: "infra", operation: "mailer" };

  constructor(private readonly deps: Dependencies) {}

  async send(template: MailerTemplate): Promise<unknown> {
    try {
      this.deps.Logger.info({ message: "Mailer attempt", metadata: template.toJSON(), ...this.base });
      const result = await this.deps.inner.send(template);
      this.deps.Logger.info({
        message: "Mailer success",
        metadata: { message: template.toJSON(), result },
        ...this.base,
      });

      return result;
    } catch (error) {
      this.deps.Logger.error({ message: "Mailer error", error: formatError(error), ...this.base });

      throw error;
    }
  }

  async verify() {
    return this.deps.inner.verify();
  }
}
