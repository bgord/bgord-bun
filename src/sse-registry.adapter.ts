import type { Message } from "./message.types";
import type { SseRegistryPort } from "./sse-registry.port";
import type { SseSenderStrategy } from "./sse-sender.strategy";

export class SseRegistryAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  private readonly senders = new Map<string, Set<SseSenderStrategy<Messages>>>();

  register(userId: string, connection: SseSenderStrategy<Messages>): void {
    if (!this.senders.has(userId)) this.senders.set(userId, new Set());

    this.senders.get(userId)!.add(connection);
  }

  unregister(userId: string, connection: SseSenderStrategy<Messages>): void {
    this.senders.get(userId)?.delete(connection);
  }

  async emit<M extends Messages>(userId: string, message: M): Promise<void> {
    for (const sender of this.senders.get(userId) ?? []) {
      await sender(message);
    }
  }
}
