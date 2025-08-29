import type { IdProviderPort } from "./id-provider.port";
import type { UUIDType } from "./uuid.vo";

export class DeterministicUuidAdapter implements IdProviderPort {
  private readonly queue: UUIDType[];
  constructor(sequence: UUIDType[] = []) {
    this.queue = [...sequence];
  }
  generate(): string {
    const next = this.queue.shift();
    if (!next) throw new Error("DeterministicUuidAdapter: sequence exhausted");
    return next;
  }
}
