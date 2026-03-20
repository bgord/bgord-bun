import type { AlertChannelPort } from "./alert-channel.port";
import type { AlertMessage } from "./alert-message.vo";

export class AlertChannelNoopAdapter implements AlertChannelPort {
  async send(_alert: AlertMessage): Promise<void> {}

  async verify(): Promise<boolean> {
    return true;
  }
}
