import type { SmsMessage } from "./sms-message.vo";

export interface SmsPort {
  send(message: SmsMessage): Promise<void>;
  verify(): Promise<boolean>;
}
