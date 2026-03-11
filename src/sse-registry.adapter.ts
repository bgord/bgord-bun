import type { Hash } from "./hash.vo";
import type { HashValueType } from "./hash-value.vo";
import type { Message } from "./message.types";
import type { SseRegistryPort, SseSenderType } from "./sse-registry.port";

export class SseRegistryAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  private readonly senders = new Map<HashValueType, Set<SseSenderType<Messages>>>();

  register(identity: Hash, connection: SseSenderType<Messages>): void {
    if (!this.senders.has(identity.get())) this.senders.set(identity.get(), new Set());

    this.senders.get(identity.get())!.add(connection);
  }

  unregister(identity: Hash, connection: SseSenderType<Messages>): void {
    this.senders.get(identity.get())?.delete(connection);
  }

  async emit<M extends Messages>(identity: Hash, message: M): Promise<void> {
    for (const sender of this.senders.get(identity.get()) ?? []) {
      await sender(message);
    }
  }
}
