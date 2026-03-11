import type { Hash } from "./hash.vo";
import type { Message } from "./message.types";

export type SseSenderType<Messages extends Message> = <M extends Messages>(message: M) => Promise<void>;

export interface SseRegistryPort<Messages extends Message> {
  register(identity: Hash, sender: SseSenderType<Messages>): void;

  unregister(identity: Hash, sender: SseSenderType<Messages>): void;

  emit<M extends Messages>(identity: Hash, message: M): Promise<void>;
}
