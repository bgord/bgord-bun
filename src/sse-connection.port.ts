import type { Message } from "./message.types";

export interface SseConnectionPort<Messages extends Message> {
  send<M extends Messages>(message: M): Promise<void>;
}
