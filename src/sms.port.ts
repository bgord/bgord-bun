import type * as tools from "@bgord/tools";

export interface SmsPort {
  send(message: tools.SmsMessage): Promise<void>;
  verify(): Promise<boolean>;
}
