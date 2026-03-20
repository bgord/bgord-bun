import type { SmsPort } from "./sms.port";
import type { SmsMessage } from "./sms-message.vo";

export class SmsNoopAdapter implements SmsPort {
  async send(_message: SmsMessage): Promise<void> {}

  async verify(): Promise<boolean> {
    return true;
  }
}
