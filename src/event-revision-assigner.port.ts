import type { GenericEventSerialized } from "./event.types";

export interface EventRevisionAssignerPort {
  assign(
    events: ReadonlyArray<GenericEventSerialized>,
    currentMax: number,
  ): ReadonlyArray<GenericEventSerialized>;
}
