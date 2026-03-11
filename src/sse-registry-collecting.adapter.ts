import type { Hash } from "./hash.vo";
import type { Message } from "./message.types";
import type { SseRegistryPort, SseSenderType } from "./sse-registry.port";

export class SseRegistryCollectingAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  public emitted: Array<{ identity: Hash; message: Messages }> = [];

  register(_identity: Hash, _sender: SseSenderType<Messages>): void {}

  unregister(_identity: Hash, _sender: SseSenderType<Messages>): void {}

  async emit<M extends Messages>(identity: Hash, message: M): Promise<void> {
    this.emitted.push({ identity, message });
  }
}
