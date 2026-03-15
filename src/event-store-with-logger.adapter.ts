import { CorrelationStorage } from "./correlation-storage.service";
import type { GenericEvent } from "./event.types";
import type { EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";
import type { LoggerPort } from "./logger.port";

type Dependencies<Event extends GenericEvent> = {
  inner: EventStorePort<Event>;
  Logger: LoggerPort;
};

export class EventStoreWithLoggerAdapter<Event extends GenericEvent> implements EventStorePort<Event> {
  constructor(private readonly deps: Dependencies<Event>) {}

  async find<FoundEvent extends Event>(
    registry: EventValidatorRegistryPort<FoundEvent>,
    stream: EventStreamType,
  ): Promise<ReadonlyArray<FoundEvent>> {
    const result = await this.deps.inner.find(registry, stream);

    this.deps.Logger.info({
      message: "Event store find",
      component: "infra",
      operation: "event_store_find",
      correlationId: CorrelationStorage.get(),
      metadata: { stream, names: registry.names, count: result.length },
    });

    return result;
  }

  async save<SavedEvent extends Event>(
    events: ReadonlyArray<SavedEvent>,
  ): Promise<ReadonlyArray<SavedEvent>> {
    const result = await this.deps.inner.save(events);

    this.deps.Logger.info({
      message: "Event store save",
      component: "infra",
      operation: "event_store_save",
      correlationId: CorrelationStorage.get(),
      metadata: { stream: events[0]?.stream, names: events.map((event) => event.name), count: events.length },
    });

    return result;
  }
}
