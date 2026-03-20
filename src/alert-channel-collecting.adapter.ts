import type { AlertChannelPort } from "./alert-channel.port";
import type { AlertMessage } from "./alert-message.vo";

export class AlertChannelCollectingAdapter implements AlertChannelPort {
  readonly alerts: Array<AlertMessage> = [];

  async send(alert: AlertMessage): Promise<void> {
    this.alerts.push(alert);
  }

  async verify(): Promise<boolean> {
    return true;
  }
}
