import { Retry, type RetryConfig } from "./retry.service";
import type { SleeperPort } from "./sleeper.port";
import type { SmsPort } from "./sms.port";
import type { SmsMessage } from "./sms-message.vo";

export type SmsWithRetryAdapterDependencies = { Sleeper: SleeperPort; inner: SmsPort };
export type SmsWithRetryAdapterConfig = { retry: RetryConfig };

export class SmsWithRetryAdapter implements SmsPort {
  constructor(
    private readonly config: SmsWithRetryAdapterConfig,
    private readonly deps: SmsWithRetryAdapterDependencies,
  ) {}

  async send(message: SmsMessage): Promise<void> {
    await new Retry(this.deps).run(async () => this.deps.inner.send(message), this.config.retry);
  }

  async verify(): Promise<boolean> {
    return this.deps.inner.verify();
  }
}
