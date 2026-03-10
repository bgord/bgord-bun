import type { Message } from "./message.types";
import type { SseConnectionPort } from "./sse-connection.port";
import type { SseRegistryPort } from "./sse-registry.port";

export class SseRegistryCollectingAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  public emitted: Array<{ userId: string; message: Messages }> = [];

  register(_userId: string, _connection: SseConnectionPort<Messages>): void {}

  unregister(_userId: string, _connection: SseConnectionPort<Messages>): void {}

  async emit<M extends Messages>(userId: string, message: M): Promise<void> {
    this.emitted.push({ userId, message });
  }
}
