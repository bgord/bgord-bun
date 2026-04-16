import type { GenericEvent, GenericEventSerialized } from "./event.types";
import type { EventFinderLastPort } from "./event-finder-last.port";
import type { EventStreamType } from "./event-stream.vo";

export class EventFinderLastNoopAdapter implements EventFinderLastPort {
  constructor(private readonly event: GenericEventSerialized | null) {}

  async findLast(
    _stream: EventStreamType,
    _names: ReadonlyArray<GenericEvent["name"]>,
  ): Promise<GenericEventSerialized | null> {
    return this.event;
  }
}
