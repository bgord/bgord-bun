import type * as tools from "@bgord/tools";
import type { Context } from "hono";
import { streamSSE } from "hono/streaming";
import type { Message } from "./message.types";
import type { SseConnectionPort } from "./sse-connection.port";
import type { SseRegistryPort } from "./sse-registry.port";

export type SseConnectionHonoAdapterConfig = { keepalive: tools.Duration };

export class SseConnectionHonoAdapter<Messages extends Message> implements SseConnectionPort<Messages> {
  private stream: Awaited<Parameters<Parameters<typeof streamSSE>[1]>[0]> | null = null;

  constructor(
    private readonly registry: SseRegistryPort<Messages>,
    private readonly userId: string,
    private readonly config: SseConnectionHonoAdapterConfig,
  ) {}

  attach(c: Context): Response {
    return streamSSE(c, async (stream) => {
      this.stream = stream;

      this.registry.register(this.userId, this);

      // Stryker disable all
      stream.onAbort(() => this.registry.unregister(this.userId, this));
      // Stryker restore all

      while (!stream.closed) {
        await stream.sleep(this.config.keepalive.ms);
        await stream.writeSSE({ event: "ping", data: "" });
      }
    });
  }

  async send<M extends Messages>(message: M): Promise<void> {
    // Stryker disable all
    await this.stream?.writeSSE({ event: message.name, data: JSON.stringify(message) });
    // Stryker restore all;
  }

  close(callback: () => void): void {
    this.registry.unregister(this.userId, this);
    callback();
    // Stryker disable all
    this.stream?.close();
    // Stryker restore all
  }
}
