import type * as tools from "@bgord/tools";
import type { AlertChannelPort } from "./alert-channel.port";
import type { AlertMessage } from "./alert-message.vo";
import type { TimeoutRunnerPort } from "./timeout-runner.port";

export type AlertChannelWithTimeoutAdapterDependencies = {
  TimeoutRunner: TimeoutRunnerPort;
  inner: AlertChannelPort;
};
export type AlertChannelWithTimeoutAdapterConfig = { timeout: tools.Duration };

export class AlertChannelWithTimeoutAdapter implements AlertChannelPort {
  constructor(
    private readonly config: AlertChannelWithTimeoutAdapterConfig,
    private readonly deps: AlertChannelWithTimeoutAdapterDependencies,
  ) {}

  async send(alert: AlertMessage): Promise<void> {
    await this.deps.TimeoutRunner.run(this.deps.inner.send(alert), this.config.timeout);
  }

  async verify(): Promise<boolean> {
    return this.deps.inner.verify();
  }
}
