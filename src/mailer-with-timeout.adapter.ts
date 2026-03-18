import type * as tools from "@bgord/tools";
import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";
import type { TimeoutRunnerPort } from "./timeout-runner.port";

export type MailerWithTimeoutAdapterDependencies = { TimeoutRunner: TimeoutRunnerPort; inner: MailerPort };
export type MailerWithTimeoutAdapterConfig = { timeout: tools.Duration };

export class MailerWithTimeoutAdapter implements MailerPort {
  constructor(
    private readonly config: MailerWithTimeoutAdapterConfig,
    private readonly deps: MailerWithTimeoutAdapterDependencies,
  ) {}

  async send(template: MailerTemplate): Promise<void> {
    await this.deps.TimeoutRunner.run(this.deps.inner.send(template), this.config.timeout);
  }

  async verify(): Promise<boolean> {
    return this.deps.inner.verify();
  }
}
