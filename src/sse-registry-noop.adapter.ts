import type { Message } from "./message.types";
import type { SseRegistryPort, SseSenderType } from "./sse-registry.port";

export class SseRegistryNoopAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  register(_userId: string, _sender: SseSenderType<Messages>): void {}

  unregister(_userId: string, _sender: SseSenderType<Messages>): void {}

  async emit<M extends Messages>(_userId: string, _message: M): Promise<void> {}
}
