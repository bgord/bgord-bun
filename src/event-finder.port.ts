import type { GenericEvent, GenericEventSerialized } from "./event.types";
import type { EventFinderConfig } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";

export interface EventFinderPort {
  find(
    stream: EventStreamType,
    names: ReadonlyArray<GenericEvent["name"]>,
    config?: EventFinderConfig,
  ): Promise<ReadonlyArray<GenericEventSerialized>>;
}
