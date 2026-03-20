import type { AlertChannelPort } from "./alert-channel.port";
import type { AlertMessage } from "./alert-message.vo";

export class AlertChannelCompositeAdapter implements AlertChannelPort {
  constructor(private readonly channels: ReadonlyArray<AlertChannelPort>) {}

  async send(alert: AlertMessage): Promise<void> {
    await Promise.allSettled(this.channels.map((channel) => channel.send(alert)));
  }

  async verify(): Promise<boolean> {
    const checks = await Promise.all(this.channels.map((channel) => channel.verify()));

    return checks.every(Boolean);
  }
}
