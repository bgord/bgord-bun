import type { Message } from "./message.types";
import type { SseSenderStrategy } from "./sse-sender.strategy";

export interface SseRegistryPort<Messages extends Message> {
  register(userId: string, sender: SseSenderStrategy<Messages>): void;

  unregister(userId: string, sender: SseSenderStrategy<Messages>): void;

  emit<M extends Messages>(userId: string, message: M): Promise<void>;
}
