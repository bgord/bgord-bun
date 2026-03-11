import { createFactory } from "hono/factory";
import type { HandlerHonoPort } from "./handler-hono.port";
import type { Message } from "./message.types";
import { SseConnectionHonoAdapter, type SseConnectionHonoAdapterConfig } from "./sse-connection-hono.adapter";
import type { SseRegistryPort } from "./sse-registry.port";

const factory = createFactory();

export class SseHonoHandler<Messages extends Message> implements HandlerHonoPort {
  constructor(
    private readonly registry: SseRegistryPort<Messages>,
    private readonly config: SseConnectionHonoAdapterConfig,
  ) {}

  handle() {
    return factory.createHandlers<{}, any, { Variables: { user: { id: string } } }>((c) => {
      const userId = c.get("user").id;
      const adapter = new SseConnectionHonoAdapter<Messages>(this.registry, userId, this.config);
      return adapter.attach(c);
    });
  }
}
