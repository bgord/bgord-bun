import type { Message } from "./message.types";
import type { SseConnectionPort } from "./sse-connection.port";
import type { SseRegistryPort } from "./sse-registry.port";

export class SseRegistryNoopAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  register(_userId: string, _connection: SseConnectionPort): void {}

  unregister(_userId: string, _connection: SseConnectionPort): void {}

  async emit<M extends Messages>(_userId: string, _message: M): Promise<void> {}
}
