import type { UserIdType } from "./modules/auth/value-objects/user-id";

export interface EventStreamEraserPort {
  erase(userId: UserIdType): Promise<void>;
}
