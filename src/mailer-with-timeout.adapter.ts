import type * as tools from "@bgord/tools";
import type { MailerPort } from "./mailer.port";
import type { MailerTemplate } from "./mailer-template.vo";
import type { TimeoutRunnerPort } from "./timeout-runner.port";

type Dependencies = { TimeoutRunner: TimeoutRunnerPort; inner: MailerPort };
type Config = { timeout: tools.Duration };

export class MailerWithTimeoutAdapter implements MailerPort {
  constructor(
    private readonly config: Config,
    private readonly deps: Dependencies,
  ) {}

  async send(template: MailerTemplate): Promise<void> {
    await this.deps.TimeoutRunner.run(this.deps.inner.send(template), this.config.timeout);
  }

  async verify(): Promise<boolean> {
    return this.deps.inner.verify();
  }
}
