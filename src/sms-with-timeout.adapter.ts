import type * as tools from "@bgord/tools";
import type { SmsPort } from "./sms.port";
import type { TimeoutRunnerPort } from "./timeout-runner.port";

export type SmsWithTimeoutAdapterDependencies = { TimeoutRunner: TimeoutRunnerPort; inner: SmsPort };
export type SmsWithTimeoutAdapterConfig = { timeout: tools.Duration };

export class SmsWithTimeoutAdapter implements SmsPort {
  constructor(
    private readonly config: SmsWithTimeoutAdapterConfig,
    private readonly deps: SmsWithTimeoutAdapterDependencies,
  ) {}

  async send(message: tools.SmsMessage): Promise<void> {
    await this.deps.TimeoutRunner.run(this.deps.inner.send(message), this.config.timeout);
  }

  async verify(): Promise<boolean> {
    return this.deps.inner.verify();
  }
}
