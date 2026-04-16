import type { GenericEvent, GenericEventSerialized } from "./event.types";
import type { EventStreamType } from "./event-stream.vo";

export interface EventFinderLastPort {
  findLast(
    stream: EventStreamType,
    names: ReadonlyArray<GenericEvent["name"]>,
  ): Promise<GenericEventSerialized | null>;
}
