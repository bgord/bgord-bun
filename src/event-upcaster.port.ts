import type { GenericEvent } from "./event.types";

export interface EventUpcasterPort {
  upcast(event: GenericEvent): GenericEvent;
}
