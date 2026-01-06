import type { NonceProviderPort } from "./nonce-provider.port";
import type { NonceValueType } from "./nonce-value.vo";

export const NonceProviderDeterministicAdapterError = {
  SequenceExhausted: "nonce.provider.deterministic.adapter.sequence.exhausted",
};

export class NonceProviderDeterministicAdapter implements NonceProviderPort {
  private readonly queue: NonceValueType[];

  constructor(sequence: NonceValueType[]) {
    this.queue = [...sequence];
  }

  generate(): NonceValueType {
    const next = this.queue.shift();

    if (!next) throw new Error(NonceProviderDeterministicAdapterError.SequenceExhausted);
    return next;
  }
}
