import type { SmsPort } from "./sms.port";
import type { SmsMessage } from "./sms-message.vo";

export class SmsCollectingAdapter implements SmsPort {
  readonly messages: Array<SmsMessage> = [];

  async send(message: SmsMessage): Promise<void> {
    this.messages.push(message);
  }

  async verify(): Promise<boolean> {
    return true;
  }
}
