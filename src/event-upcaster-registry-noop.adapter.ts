import type { GenericEvent } from "./event.types";
import type { EventUpcasterRegistryPort } from "./event-upcaster-registry.port";

export class EventUpcasterRegistryNoopAdapter implements EventUpcasterRegistryPort {
  upcast(raw: GenericEvent): GenericEvent {
    return raw;
  }
}
