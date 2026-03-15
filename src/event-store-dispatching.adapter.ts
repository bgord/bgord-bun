import type { GenericEvent } from "./event.types";
import type { EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";
import type { EventBusPort } from "./message-bus.port";

type Dependencies<TEvent extends GenericEvent> = {
  inner: EventStorePort<TEvent>;
  EventBus: EventBusPort<TEvent>;
};

export class EventStoreDispatchingAdapter<Event extends GenericEvent> implements EventStorePort<Event> {
  constructor(private readonly deps: Dependencies<Event>) {}

  async find<FoundEvent extends Event>(
    registry: EventValidatorRegistryPort<FoundEvent>,
    stream: EventStreamType,
  ): Promise<ReadonlyArray<FoundEvent>> {
    return this.deps.inner.find(registry, stream);
  }

  async save<SavedEvent extends Event>(
    events: ReadonlyArray<SavedEvent>,
  ): Promise<ReadonlyArray<SavedEvent>> {
    const saved = await this.deps.inner.save(events);

    await Promise.all(saved.map((event) => this.deps.EventBus.emit(event)));

    return saved;
  }
}
