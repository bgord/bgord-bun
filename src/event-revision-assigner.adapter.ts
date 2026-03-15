import type { GenericEventSerialized } from "./event.types";
import type { EventRevisionAssignerPort } from "./event-revision-assigner.port";

export class EventRevisionAssignerAdapter implements EventRevisionAssignerPort {
  static readonly EMPTY_STREAM_REVISION = -1;

  assign(
    events: ReadonlyArray<GenericEventSerialized>,
    currentMax: number,
  ): ReadonlyArray<GenericEventSerialized> {
    return events.map((event, index) => ({ ...event, revision: currentMax + index + 1 }));
  }
}
