import type * as tools from "@bgord/tools";
import type { AlertChannelPort } from "./alert-channel.port";
import type { AlertMessage } from "./alert-message.vo";
import type { SmsPort } from "./sms.port";

export type AlertChannelSmsAdapterConfig = { message: (alert: AlertMessage) => tools.SmsMessage };
export type AlertChannelSmsAdapterDependencies = { Sms: SmsPort };

export class AlertChannelSmsAdapter implements AlertChannelPort {
  constructor(
    private readonly config: AlertChannelSmsAdapterConfig,
    private readonly deps: AlertChannelSmsAdapterDependencies,
  ) {}

  async send(alert: AlertMessage): Promise<void> {
    await this.deps.Sms.send(this.config.message(alert));
  }

  async verify(): Promise<boolean> {
    return this.deps.Sms.verify();
  }
}
