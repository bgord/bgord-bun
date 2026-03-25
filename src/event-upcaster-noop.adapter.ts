import type { GenericEvent } from "./event.types";
import type { EventUpcasterPort } from "./event-upcaster.port";

export class EventUpcasterNoopAdapter implements EventUpcasterPort {
  upcast(event: GenericEvent): GenericEvent {
    return event;
  }
}
