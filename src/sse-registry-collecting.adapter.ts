import type { Message } from "./message.types";
import type { SseRegistryPort } from "./sse-registry.port";
import type { SseSenderStrategy } from "./sse-sender.strategy";

export class SseRegistryCollectingAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  public emitted: Array<{ userId: string; message: Messages }> = [];

  register(_userId: string, _sender: SseSenderStrategy<Messages>): void {}

  unregister(_userId: string, _sender: SseSenderStrategy<Messages>): void {}

  async emit<M extends Messages>(userId: string, message: M): Promise<void> {
    this.emitted.push({ userId, message });
  }
}
