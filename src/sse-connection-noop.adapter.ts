import type { Message } from "./message.types";
import type { SseConnectionPort } from "./sse-connection.port";

export class SseConnectionNoopAdapter<Messages extends Message> implements SseConnectionPort<Messages> {
  async send<M extends Messages>(_message: M) {}

  close(): void {}

  onClose(_callback: () => void): void {}
}
