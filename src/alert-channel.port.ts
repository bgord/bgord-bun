import type { AlertMessage } from "./alert-message.vo";

export interface AlertChannelPort {
  send(alert: AlertMessage): Promise<void>;

  verify(): Promise<boolean>;
}
