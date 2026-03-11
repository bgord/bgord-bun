import type { HashValueType } from "./hash-value.vo";
import type { Message } from "./message.types";
import type { SseRegistryPort, SseSenderType } from "./sse-registry.port";

export class SseRegistryNoopAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  register(_identity: HashValueType, _sender: SseSenderType<Messages>): void {}

  unregister(_identity: HashValueType, _sender: SseSenderType<Messages>): void {}

  async emit<M extends Messages>(_identity: HashValueType, _message: M): Promise<void> {}
}
