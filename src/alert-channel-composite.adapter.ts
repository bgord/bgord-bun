import type { AlertChannelPort } from "./alert-channel.port";
import type { AlertMessage } from "./alert-message.vo";

export const AlertChannelCompositeError = {
  Min: "alert.channel.composite.channels.min",
  Max: "alert.channel.composite.channels.max",
};

export class AlertChannelCompositeAdapter implements AlertChannelPort {
  constructor(private readonly channels: ReadonlyArray<AlertChannelPort>) {
    if (this.channels.length === 0) throw new Error(AlertChannelCompositeError.Min);
    if (this.channels.length > 5) throw new Error(AlertChannelCompositeError.Max);
  }

  async send(alert: AlertMessage): Promise<void> {
    await Promise.allSettled(this.channels.map((channel) => channel.send(alert)));
  }

  async verify(): Promise<boolean> {
    const checks = await Promise.allSettled(this.channels.map((channel) => channel.verify()));

    return checks.every((result) => result.status === "fulfilled" && result.value === true);
  }
}
