import type { GenericEvent, GenericParsedEvent } from "./event.types";
import type { EventStreamType } from "./event-stream.vo";

export interface EventFinderPort {
  find(
    stream: EventStreamType,
    names: ReadonlyArray<GenericEvent["name"]>,
  ): Promise<ReadonlyArray<GenericParsedEvent>>;
}
