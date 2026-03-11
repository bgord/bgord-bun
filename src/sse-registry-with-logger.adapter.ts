import { CorrelationStorage } from "./correlation-storage.service";
import type { HashValueType } from "./hash-value.vo";
import type { LoggerPort } from "./logger.port";
import type { Message } from "./message.types";
import type { SseRegistryPort, SseSenderType } from "./sse-registry.port";

type Dependencies<Messages extends Message> = { inner: SseRegistryPort<Messages>; Logger: LoggerPort };

export class SseRegistryWithLoggerAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  private readonly base = { component: "infra", operation: "sse_registry" };

  constructor(private readonly deps: Dependencies<Messages>) {}

  register(identity: HashValueType, sender: SseSenderType<Messages>): void {
    this.deps.Logger.info({
      message: "SSE sender registered",
      metadata: { identity },
      correlationId: CorrelationStorage.get(),
      ...this.base,
    });

    this.deps.inner.register(identity, sender);
  }

  unregister(identity: HashValueType, sender: SseSenderType<Messages>): void {
    this.deps.Logger.info({
      message: "SSE sender unregistered",
      metadata: { identity },
      correlationId: CorrelationStorage.get(),
      ...this.base,
    });

    this.deps.inner.unregister(identity, sender);
  }

  async emit<M extends Messages>(identity: HashValueType, message: M): Promise<void> {
    this.deps.Logger.info({
      message: `${message.name} emitted`,
      metadata: { identity, message },
      correlationId: CorrelationStorage.get(),
      ...this.base,
    });

    return this.deps.inner.emit(identity, message);
  }
}
