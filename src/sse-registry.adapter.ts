import type { HashValueType } from "./hash-value.vo";
import type { Message } from "./message.types";
import type { SseRegistryPort, SseSenderType } from "./sse-registry.port";

export class SseRegistryAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  private readonly senders = new Map<HashValueType, Set<SseSenderType<Messages>>>();

  register(identity: HashValueType, connection: SseSenderType<Messages>): void {
    if (!this.senders.has(identity)) this.senders.set(identity, new Set());

    this.senders.get(identity)?.add(connection);
  }

  unregister(identity: HashValueType, connection: SseSenderType<Messages>): void {
    const senders = this.senders.get(identity);

    if (!senders) return;

    senders.delete(connection);

    if (senders.size === 0) this.senders.delete(identity);
  }

  async emit<M extends Messages>(identity: HashValueType, message: M): Promise<void> {
    for (const sender of this.senders.get(identity) ?? []) {
      await sender(message);
    }
  }

  count(identity: HashValueType): number {
    return this.senders.get(identity)?.size ?? 0;
  }
}
