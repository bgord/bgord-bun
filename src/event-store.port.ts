import type { GenericEvent } from "./event.types";
import type { EventStreamType } from "./event-stream.vo";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";

export interface EventStorePort<Event extends GenericEvent> {
  find<FoundEvent extends Event>(
    registry: EventValidatorRegistryPort<FoundEvent>,
    stream: EventStreamType,
  ): Promise<ReadonlyArray<FoundEvent>>;

  save<SavedEvent extends Event>(events: ReadonlyArray<SavedEvent>): Promise<ReadonlyArray<SavedEvent>>;
}
