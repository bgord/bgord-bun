import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { HashValueType } from "./hash-value.vo";
import type { LoggerPort } from "./logger.port";
import type { Message } from "./message.types";
import type { SseRegistryPort, SseSenderType } from "./sse-registry.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies<Messages extends Message> = {
  inner: SseRegistryPort<Messages>;
  Logger: LoggerPort;
  Clock: ClockPort;
};

export class SseRegistryWithLoggerAdapter<Messages extends Message> implements SseRegistryPort<Messages> {
  private readonly base = { component: "infra", operation: "sse_registry" };

  constructor(private readonly deps: Dependencies<Messages>) {}

  register(identity: HashValueType, sender: SseSenderType<Messages>): boolean {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "SSE registry register attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { identity },
        ...this.base,
      });

      const registered = this.deps.inner.register(identity, sender);

      this.deps.Logger.info({
        message: "SSE registry register success",
        correlationId: CorrelationStorage.get(),
        metadata: { identity, registered, duration: duration.stop() },
        ...this.base,
      });

      return registered;
    } catch (error) {
      this.deps.Logger.error({
        message: "SSE registry register error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { identity, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  unregister(identity: HashValueType, sender: SseSenderType<Messages>): void {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "SSE registry unregister attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { identity },
        ...this.base,
      });

      this.deps.inner.unregister(identity, sender);

      this.deps.Logger.info({
        message: "SSE registry unregister success",
        correlationId: CorrelationStorage.get(),
        metadata: { identity, duration: duration.stop() },
        ...this.base,
      });
    } catch (error) {
      this.deps.Logger.error({
        message: "SSE registry unregister error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { identity, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  async emit<M extends Messages>(identity: HashValueType, message: M): Promise<void> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "SSE registry emit attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { identity, message },
        ...this.base,
      });

      await this.deps.inner.emit(identity, message);

      this.deps.Logger.info({
        message: "SSE registry emit success",
        correlationId: CorrelationStorage.get(),
        metadata: { identity, message, duration: duration.stop() },
        ...this.base,
      });
    } catch (error) {
      this.deps.Logger.error({
        message: "SSE registry emit error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { identity, message, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  count(identity: HashValueType): number {
    return this.deps.inner.count(identity);
  }
}
