import type * as tools from "@bgord/tools";
import type { SmsPort } from "./sms.port";

export class SmsNoopAdapter implements SmsPort {
  async send(_message: tools.SmsMessage): Promise<void> {}

  async verify(): Promise<boolean> {
    return true;
  }
}
