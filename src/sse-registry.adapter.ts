import type { Message } from "./message.types";
import type { SseConnectionPort } from "./sse-connection.port";
import type { SseRegistryPort } from "./sse-registry.port";

export class SseRegistryAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  private readonly connections = new Map<string, Set<SseConnectionPort<Messages>>>();

  register(userId: string, connection: SseConnectionPort<Messages>): void {
    if (!this.connections.has(userId)) this.connections.set(userId, new Set());

    this.connections.get(userId)!.add(connection);
  }

  unregister(userId: string, connection: SseConnectionPort<Messages>): void {
    this.connections.get(userId)?.delete(connection);
  }

  async emit<M extends Messages>(userId: string, message: M): Promise<void> {
    for (const connection of this.connections.get(userId) ?? []) {
      await connection.send(message);
    }
  }
}
