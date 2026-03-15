import type { GenericEventSerialized } from "./event.types";
import type { EventRevisionAssignerPort } from "./event-revision-assigner.port";

export class EventRevisionAssignerAdapter implements EventRevisionAssignerPort {
  static readonly EMPTY_STREAM_REVISION = -1;

  assign(
    events: ReadonlyArray<GenericEventSerialized>,
    max: number = EventRevisionAssignerAdapter.EMPTY_STREAM_REVISION,
  ): ReadonlyArray<GenericEventSerialized> {
    return events.map((event, index) => ({ ...event, revision: max + index + 1 }));
  }
}
