import type { HashValueType } from "./hash-value.vo";
import type { Message } from "./message.types";

export type SseSenderType<Messages extends Message> = <M extends Messages>(message: M) => Promise<void>;

export interface SseRegistryPort<Messages extends Message> {
  register(identity: HashValueType, sender: SseSenderType<Messages>): void;

  unregister(identity: HashValueType, sender: SseSenderType<Messages>): void;

  emit<M extends Messages>(identity: HashValueType, message: M): Promise<void>;

  count(identity: HashValueType): number;
}
