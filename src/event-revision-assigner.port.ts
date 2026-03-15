import type { GenericEventSerialized } from "./event.types";

export interface EventRevisionAssignerPort {
  assign(
    events: ReadonlyArray<GenericEventSerialized>,
    max: number | undefined,
  ): ReadonlyArray<GenericEventSerialized>;
}
