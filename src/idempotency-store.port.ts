import type { Hash } from "./hash.vo";

export interface IdempotencyStorePort {
  claim(subject: Hash): Promise<boolean>;
}
