import type { HashValueType } from "./hash-value.vo";
import type { Message } from "./message.types";
import type { SseRegistryPort, SseSenderType } from "./sse-registry.port";

export class SseRegistryCollectingAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  public emitted: Array<{ identity: HashValueType; message: Messages }> = [];

  register(_identity: HashValueType, _sender: SseSenderType<Messages>): void {}

  unregister(_identity: HashValueType, _sender: SseSenderType<Messages>): void {}

  async emit<M extends Messages>(identity: HashValueType, message: M): Promise<void> {
    this.emitted.push({ identity, message });
  }

  count(_identity: HashValueType): number {
    return 0;
  }
}
