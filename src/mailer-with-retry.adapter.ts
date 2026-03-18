import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";
import { Retry, type RetryConfig } from "./retry.service";
import type { SleeperPort } from "./sleeper.port";

type Dependencies = { Sleeper: SleeperPort; inner: MailerPort };
type Config = { retry: RetryConfig };

export class MailerWithRetryAdapter implements MailerPort {
  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  async send(template: MailerTemplate): Promise<void> {
    await new Retry(this.deps).run(async () => this.deps.inner.send(template), this.config.retry);
  }

  async verify(): Promise<boolean> {
    return this.deps.inner.verify();
  }
}
