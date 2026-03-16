import type * as tools from "@bgord/tools";
import type { HashValueType } from "./hash-value.vo";
import type { Message } from "./message.types";
import type { SseRegistryPort, SseSenderType } from "./sse-registry.port";

type Dependencies<Messages extends Message> = {
  inner: SseRegistryPort<Messages>;
  limit: tools.IntegerPositiveType;
};

export class SseRegistryWithLimitAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  constructor(private readonly deps: Dependencies<Messages>) {}

  register(identity: HashValueType, sender: SseSenderType<Messages>): void {
    if (this.deps.inner.count(identity) >= this.deps.limit) return;

    this.deps.inner.register(identity, sender);
  }

  unregister(identity: HashValueType, sender: SseSenderType<Messages>): void {
    this.deps.inner.unregister(identity, sender);
  }

  async emit<M extends Messages>(identity: HashValueType, message: M): Promise<void> {
    return this.deps.inner.emit(identity, message);
  }

  count(identity: HashValueType): number {
    return this.deps.inner.count(identity);
  }
}
