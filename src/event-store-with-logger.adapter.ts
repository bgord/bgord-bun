import type { ClockPort } from "./clock.port";
import { CorrelationStorage } from "./correlation-storage.service";
import type { GenericEvent } from "./event.types";
import type { EventFinderConfig, EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";
import type { LoggerPort } from "./logger.port";
import { Stopwatch } from "./stopwatch.service";

type Dependencies<Event extends GenericEvent> = {
  inner: EventStorePort<Event>;
  Logger: LoggerPort;
  Clock: ClockPort;
};

export class EventStoreWithLoggerAdapter<Event extends GenericEvent> implements EventStorePort<Event> {
  private readonly base = { component: "infra", operation: "event_store" };

  constructor(private readonly deps: Dependencies<Event>) {}

  async find<FoundEvent extends Event>(
    registry: EventValidatorRegistryPort<FoundEvent>,
    stream: EventStreamType,
    config?: EventFinderConfig,
  ): Promise<ReadonlyArray<FoundEvent>> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Event store find attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { stream, names: registry.names, config },
        ...this.base,
      });

      const result = await this.deps.inner.find(registry, stream, config);

      this.deps.Logger.info({
        message: "Event store find success",
        correlationId: CorrelationStorage.get(),
        metadata: { stream, names: registry.names, config, count: result.length, duration: duration.stop() },
        ...this.base,
      });

      return result;
    } catch (error) {
      this.deps.Logger.error({
        message: "Event store find error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { stream, names: registry.names, config, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  async findLast<FoundEvent extends Event>(
    registry: EventValidatorRegistryPort<FoundEvent>,
    stream: EventStreamType,
  ): Promise<FoundEvent | null> {
    const duration = new Stopwatch(this.deps);

    try {
      this.deps.Logger.info({
        message: "Event store find last attempt",
        correlationId: CorrelationStorage.get(),
        metadata: { stream, names: registry.names },
        ...this.base,
      });

      const result = await this.deps.inner.findLast(registry, stream);

      this.deps.Logger.info({
        message: "Event store find last success",
        correlationId: CorrelationStorage.get(),
        metadata: { stream, names: registry.names, found: !!result, duration: duration.stop() },
        ...this.base,
      });

      return result;
    } catch (error) {
      this.deps.Logger.error({
        message: "Event store find last error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { stream, names: registry.names, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }

  async save<SavedEvent extends Event>(
    events: ReadonlyArray<SavedEvent>,
  ): Promise<ReadonlyArray<SavedEvent>> {
    const duration = new Stopwatch(this.deps);
    const metadata = {
      stream: events[0]?.stream,
      names: events.map((event) => event.name),
      count: events.length,
    };

    try {
      this.deps.Logger.info({
        message: "Event store save attempt",
        correlationId: CorrelationStorage.get(),
        metadata,
        ...this.base,
      });

      const result = await this.deps.inner.save(events);

      this.deps.Logger.info({
        message: "Event store save success",
        correlationId: CorrelationStorage.get(),
        metadata: { ...metadata, duration: duration.stop() },
        ...this.base,
      });

      return result;
    } catch (error) {
      this.deps.Logger.error({
        message: "Event store save error",
        correlationId: CorrelationStorage.get(),
        error,
        metadata: { ...metadata, duration: duration.stop() },
        ...this.base,
      });

      throw error;
    }
  }
}
