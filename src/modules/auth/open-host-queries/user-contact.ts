import type * as tools from "@bgord/tools";
import type * as VO from "../value-objects";

export type EmailContact = { type: "email"; address: tools.EmailType };

export interface UserContactOHQ {
  getPrimary(userId: VO.UserIdType): Promise<EmailContact | undefined>;
}
