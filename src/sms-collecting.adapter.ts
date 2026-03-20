import type * as tools from "@bgord/tools";
import type { SmsPort } from "./sms.port";

export class SmsCollectingAdapter implements SmsPort {
  readonly messages: Array<tools.SmsMessage> = [];

  async send(message: tools.SmsMessage): Promise<void> {
    this.messages.push(message);
  }

  async verify(): Promise<boolean> {
    return true;
  }
}
