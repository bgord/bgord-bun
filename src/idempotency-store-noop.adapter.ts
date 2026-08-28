import type { Hash } from "./hash.vo";
import type { IdempotencyStorePort } from "./idempotency-store.port";

export class IdempotencyStoreNoopAdapter implements IdempotencyStorePort {
  async claim(_subject: Hash): Promise<boolean> {
    return true;
  }
}
