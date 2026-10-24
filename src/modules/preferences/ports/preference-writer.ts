import type * as tools from "@bgord/tools";
import type { UserIdType } from "../../auth/value-objects/user-id";

export type PreferenceWriterInput<K extends string> = {
  userId: UserIdType;
  key: K;
  value: string;
  at: tools.TimestampValueType;
};

export interface PreferenceWriterPort<K extends string = string> {
  set(input: PreferenceWriterInput<K>): Promise<void>;
}
