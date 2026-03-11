import type { Hash } from "./hash.vo";
import type { Message } from "./message.types";
import type { SseRegistryPort, SseSenderType } from "./sse-registry.port";

export class SseRegistryNoopAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  register(_identity: Hash, _sender: SseSenderType<Messages>): void {}

  unregister(_identity: Hash, _sender: SseSenderType<Messages>): void {}

  async emit<M extends Messages>(_identity: Hash, _message: M): Promise<void> {}
}
