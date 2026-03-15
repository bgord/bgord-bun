import type { GenericEvent } from "./event.types";
import type { EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";

export class EventStoreCollectingAdapter<TEvent extends GenericEvent> implements EventStorePort<TEvent> {
  readonly saved: Array<TEvent> = [];

  async find<FoundEvent extends TEvent>(
    _registry: EventValidatorRegistryPort<FoundEvent>,
    _stream: EventStreamType,
  ): Promise<ReadonlyArray<FoundEvent>> {
    return [];
  }

  async save(events: ReadonlyArray<TEvent>): Promise<ReadonlyArray<TEvent>> {
    this.saved.push(...events);
    return [...events];
  }
}
