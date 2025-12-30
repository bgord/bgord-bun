import type { IdProviderPort } from "./id-provider.port";
import type { UUIDType } from "./uuid.vo";

export const IdProviderDeterministicAdapterError = {
  SequenceExhausted: "id.provider.deterministic.adapter.sequence.exhausted",
} as const;

export class IdProviderDeterministicAdapter implements IdProviderPort {
  private readonly queue: UUIDType[];

  constructor(sequence: UUIDType[] = []) {
    this.queue = [...sequence];
  }

  generate(): UUIDType {
    const next = this.queue.shift();

    if (!next) throw new Error(IdProviderDeterministicAdapterError.SequenceExhausted);
    return next;
  }
}
