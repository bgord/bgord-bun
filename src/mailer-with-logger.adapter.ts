import type { ClockPort } from "./clock.port";
import type { LoggerPort } from "./logger.port";
import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";
import { Stopwatch } from "./stopwatch.service";

type Dependencies = { inner: MailerPort; Logger: LoggerPort; Clock: ClockPort };

export class MailerWithLoggerAdapter implements MailerPort {
  private readonly base = { component: "infra", operation: "mailer" };

  constructor(private readonly deps: Dependencies) {}

  async send(template: MailerTemplate): Promise<void> {
    const stopwatch = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({ message: "Mailer attempt", metadata: template.toJSON(), ...this.base });

      await this.deps.inner.send(template);

      this.deps.Logger.info({
        message: "Mailer success",
        metadata: { template: template.toJSON(), duration: stopwatch.stop() },
        ...this.base,
      });
    } catch (error) {
      this.deps.Logger.error({ message: "Mailer error", error, metadata: stopwatch.stop(), ...this.base });

      throw error;
    }
  }

  async verify(): Promise<boolean> {
    return this.deps.inner.verify();
  }
}
