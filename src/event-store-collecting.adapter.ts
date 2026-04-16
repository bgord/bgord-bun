import type { GenericEvent } from "./event.types";
import type { EventFinderConfig, EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";

export class EventStoreCollectingAdapter<Event extends GenericEvent> implements EventStorePort<Event> {
  readonly saved: Array<Event> = [];

  async find<FoundEvent extends Event>(
    _registry: EventValidatorRegistryPort<FoundEvent>,
    _stream: EventStreamType,
    _config?: EventFinderConfig,
  ): Promise<ReadonlyArray<FoundEvent>> {
    return [];
  }

  async findLast<FoundEvent extends Event>(
    _registry: EventValidatorRegistryPort<FoundEvent>,
    _stream: EventStreamType,
  ): Promise<FoundEvent | null> {
    return null;
  }

  async save<SavedEvent extends Event>(
    events: ReadonlyArray<SavedEvent>,
  ): Promise<ReadonlyArray<SavedEvent>> {
    this.saved.push(...events);

    return [...events];
  }
}
