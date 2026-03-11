import type * as tools from "@bgord/tools";
import { createFactory } from "hono/factory";
import { streamSSE } from "hono/streaming";
import type { HandlerHonoPort } from "./handler-hono.port";
import type { Message } from "./message.types";
import type { SseRegistryPort } from "./sse-registry.port";

export type SseHonoHandlerConfig = { keepalive: tools.Duration };

const factory = createFactory();

export class SseHonoHandler<Messages extends Message> implements HandlerHonoPort {
  constructor(
    private readonly registry: SseRegistryPort<Messages>,
    private readonly config: SseHonoHandlerConfig,
  ) {}

  handle() {
    return factory.createHandlers<{}, any, { Variables: { user: { id: string } } }>((c) => {
      const userId = c.get("user").id;

      return streamSSE(c, async (stream) => {
        const send = async <M extends Messages>(message: M) => {
          await stream.writeSSE({ event: message.name, data: JSON.stringify(message) });
        };

        this.registry.register(userId, send);

        // Stryker disable all
        stream.onAbort(() => this.registry.unregister(userId, send));
        // Stryker restore all

        while (!stream.closed) {
          await stream.sleep(this.config.keepalive.ms);
          await stream.writeSSE({ event: "ping", data: "" });
        }
      });
    });
  }
}
