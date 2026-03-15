import type { GenericEvent } from "./event.types";
import type { EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventBusPort } from "./message-bus.port";

type Dependencies<TEvent extends GenericEvent> = {
  inner: EventStorePort<TEvent>;
  EventBus: EventBusPort<TEvent>;
};

export class EventStoreDispatchingAdapter<TEvent extends GenericEvent> implements EventStorePort<TEvent> {
  constructor(private readonly deps: Dependencies<TEvent>) {}

  async find(stream: EventStreamType): Promise<ReadonlyArray<TEvent>> {
    return this.deps.inner.find(stream);
  }

  async save(events: ReadonlyArray<TEvent>): Promise<ReadonlyArray<TEvent>> {
    const saved = await this.deps.inner.save(events);

    await Promise.all(saved.map((event) => this.deps.EventBus.emit(event)));

    return saved;
  }
}
