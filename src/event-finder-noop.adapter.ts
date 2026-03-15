import type { GenericEvent, GenericEventSerialized } from "./event.types";
import type { EventFinderPort } from "./event-finder.port";
import type { EventStreamType } from "./event-stream.vo";

export class EventFinderNoopAdapter implements EventFinderPort {
  constructor(private readonly events: ReadonlyArray<GenericEventSerialized>) {}

  async find(
    _stream: EventStreamType,
    _names: ReadonlyArray<GenericEvent["name"]>,
  ): Promise<ReadonlyArray<GenericEventSerialized>> {
    return this.events;
  }
}
