import type { AlertChannelPort } from "./alert-channel.port";
import type { AlertMessage } from "./alert-message.vo";
import { Retry, type RetryConfig } from "./retry.service";
import type { SleeperPort } from "./sleeper.port";

export type AlertChannelWithRetryAdapterDependencies = { Sleeper: SleeperPort; inner: AlertChannelPort };
export type AlertChannelWithRetryAdapterConfig = { retry: RetryConfig };

export class AlertChannelWithRetryAdapter implements AlertChannelPort {
  constructor(
    private readonly config: AlertChannelWithRetryAdapterConfig,
    private readonly deps: AlertChannelWithRetryAdapterDependencies,
  ) {}

  async send(alert: AlertMessage): Promise<void> {
    await new Retry(this.deps).run(async () => this.deps.inner.send(alert), this.config.retry);
  }

  async verify(): Promise<boolean> {
    return this.deps.inner.verify();
  }
}
