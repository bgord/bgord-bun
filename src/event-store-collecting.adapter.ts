import type { GenericEvent } from "./event.types";
import type { EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";

export class EventStoreCollectingAdapter<Event extends GenericEvent> implements EventStorePort<Event> {
  readonly saved: Array<Event> = [];

  async find<FoundEvent extends Event>(
    _registry: EventValidatorRegistryPort<FoundEvent>,
    _stream: EventStreamType,
  ): Promise<ReadonlyArray<FoundEvent>> {
    return [];
  }

  async save<SavedEvent extends Event>(
    events: ReadonlyArray<SavedEvent>,
  ): Promise<ReadonlyArray<SavedEvent>> {
    this.saved.push(...events);

    return [...events];
  }
}
