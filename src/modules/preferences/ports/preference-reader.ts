import type { UserIdType } from "../../auth/value-objects/user-id";

export interface PreferenceReaderPort<K extends string = string> {
  get(userId: UserIdType, key: K): Promise<string | null>;
}
