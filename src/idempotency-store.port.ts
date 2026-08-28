import type { Hash } from "./hash.vo";

export interface IdempotencyStorePort {
  register(subject: Hash): Promise<boolean>;
}
