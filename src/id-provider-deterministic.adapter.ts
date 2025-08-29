import type { IdProviderPort } from "./id-provider.port";
import type { UUIDType } from "./uuid.vo";

export class IdProviderDeterministicAdapter implements IdProviderPort {
  private readonly queue: UUIDType[];
  constructor(sequence: UUIDType[] = []) {
    this.queue = [...sequence];
  }
  generate(): string {
    const next = this.queue.shift();
    if (!next) throw new Error("IdProviderDeterministicAdapter: sequence exhausted");
    return next;
  }
}
