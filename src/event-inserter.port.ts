import type { GenericEventSerialized } from "./event.types";

export interface EventInserterPort {
  insert(events: ReadonlyArray<GenericEventSerialized>): Promise<ReadonlyArray<GenericEventSerialized>>;
}
