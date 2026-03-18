import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";
import { Retry, type RetryConfig } from "./retry.service";
import type { SleeperPort } from "./sleeper.port";

export type MailerWithRetryAdapterDependencies = { Sleeper: SleeperPort; inner: MailerPort };
export type MailerWithRetryAdapterConfig = { retry: RetryConfig };

export class MailerWithRetryAdapter implements MailerPort {
  constructor(
    private readonly config: MailerWithRetryAdapterConfig,
    private readonly deps: MailerWithRetryAdapterDependencies,
  ) {}

  async send(template: MailerTemplate): Promise<void> {
    await new Retry(this.deps).run(async () => this.deps.inner.send(template), this.config.retry);
  }

  async verify(): Promise<boolean> {
    return this.deps.inner.verify();
  }
}
