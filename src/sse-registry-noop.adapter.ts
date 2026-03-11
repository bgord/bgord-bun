import type { Message } from "./message.types";
import type { SseRegistryPort } from "./sse-registry.port";
import type { SseSenderStrategy } from "./sse-sender.strategy";

export class SseRegistryNoopAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  register(_userId: string, _sender: SseSenderStrategy<Messages>): void {}

  unregister(_userId: string, _sender: SseSenderStrategy<Messages>): void {}

  async emit<M extends Messages>(_userId: string, _message: M): Promise<void> {}
}
