import type { Message } from "./message.types";
import type { SseConnectionPort } from "./sse-connection.port";

export interface SseRegistryPort<Messages extends Message> {
  register(userId: string, connection: SseConnectionPort<Messages>): void;

  unregister(userId: string, connection: SseConnectionPort<Messages>): void;

  emit<M extends Messages>(userId: string, message: M): Promise<void>;
}
