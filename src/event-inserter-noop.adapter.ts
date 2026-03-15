import type { GenericEventSerialized } from "./event.types";
import type { EventInserterPort } from "./event-inserter.port";

export class EventInserterNoopAdapter implements EventInserterPort {
  async insert(
    events: ReadonlyArray<GenericEventSerialized>,
  ): Promise<ReadonlyArray<GenericEventSerialized>> {
    return events;
  }
}
