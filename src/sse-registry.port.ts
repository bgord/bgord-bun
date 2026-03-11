import type { Message } from "./message.types";

export type SseSenderType<Messages extends Message> = <M extends Messages>(message: M) => Promise<void>;

export interface SseRegistryPort<Messages extends Message> {
  register(userId: string, sender: SseSenderType<Messages>): void;

  unregister(userId: string, sender: SseSenderType<Messages>): void;

  emit<M extends Messages>(userId: string, message: M): Promise<void>;
}
