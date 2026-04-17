import type { GenericEvent } from "./event.types";
import type { EventFinderConfig, EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";
import type { EventBusPort } from "./message-bus.port";

type Dependencies<Event extends GenericEvent> = {
  inner: EventStorePort<Event>;
  EventBus: EventBusPort<Event>;
};

export class EventStoreDispatchingAdapter<Event extends GenericEvent> implements EventStorePort<Event> {
  constructor(private readonly deps: Dependencies<Event>) {}

  async find<FoundEvent extends Event>(
    registry: EventValidatorRegistryPort<FoundEvent>,
    stream: EventStreamType,
    config?: EventFinderConfig,
  ): Promise<ReadonlyArray<FoundEvent>> {
    return this.deps.inner.find(registry, stream, config);
  }

  async findLast<FoundEvent extends Event>(
    registry: EventValidatorRegistryPort<FoundEvent>,
    stream: EventStreamType,
  ): Promise<FoundEvent | null> {
    return this.deps.inner.findLast(registry, stream);
  }

  async save<SavedEvent extends Event>(
    events: ReadonlyArray<SavedEvent>,
  ): Promise<ReadonlyArray<SavedEvent>> {
    const saved = await this.deps.inner.save(events);

    for (const event of saved) this.deps.EventBus.emit(event);

    return saved;
  }
}
