import type { SmsBodyType } from "./sms-body.vo";
import type { TelephoneNumberType } from "./telephone-number.vo";

export class SmsMessage {
  constructor(
    readonly to: TelephoneNumberType,
    readonly body: SmsBodyType,
    readonly from?: TelephoneNumberType,
  ) {}

  toJSON() {
    return { to: this.to, from: this.from, body: this.body };
  }
}
