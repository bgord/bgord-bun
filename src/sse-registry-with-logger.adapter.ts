import { CorrelationStorage } from "./correlation-storage.service";
import type { LoggerPort } from "./logger.port";
import type { Message } from "./message.types";
import type { SseConnectionPort } from "./sse-connection.port";
import type { SseRegistryPort } from "./sse-registry.port";

type Dependencies<Messages extends Message> = { inner: SseRegistryPort<Messages>; Logger: LoggerPort };

export class SseRegistryWithLoggerAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  private readonly base = { component: "infra", operation: "sse_registry" };

  constructor(private readonly deps: Dependencies<Messages>) {}

  register(userId: string, connection: SseConnectionPort<Messages>): void {
    this.deps.Logger.info({
      message: "SSE connection registered",
      metadata: { userId },
      correlationId: CorrelationStorage.get(),
      ...this.base,
    });

    this.deps.inner.register(userId, connection);
  }

  unregister(userId: string, connection: SseConnectionPort<Messages>): void {
    this.deps.Logger.info({
      message: "SSE connection unregistered",
      metadata: { userId },
      correlationId: CorrelationStorage.get(),
      ...this.base,
    });

    this.deps.inner.unregister(userId, connection);
  }

  async emit<M extends Messages>(userId: string, message: M): Promise<void> {
    this.deps.Logger.info({
      message: `${message.name} emitted`,
      metadata: { userId, message },
      correlationId: CorrelationStorage.get(),
      ...this.base,
    });

    return this.deps.inner.emit(userId, message);
  }
}
