import type { IdProviderPort } from "./id-provider.port";
import type { UUIDType } from "./uuid.vo";

export const IdProviderDeterministicAdapterError = {
  SequenceExhausted: "id.provider.deterministic.adapter.sequence.exhausted",
};

export class IdProviderDeterministicAdapter implements IdProviderPort {
  constructor(private readonly queue: UUIDType[]) {}

  generate(): UUIDType {
    const next = this.queue.shift();

    if (!next) throw new Error(IdProviderDeterministicAdapterError.SequenceExhausted);
    return next;
  }
}
