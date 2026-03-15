import type { GenericEvent } from "./event.types";
import type { EventStreamType } from "./event-stream.vo";

export interface EventStorePort<TEvent extends GenericEvent> {
  find(stream: EventStreamType): Promise<ReadonlyArray<TEvent>>;
  save(events: ReadonlyArray<TEvent>): Promise<ReadonlyArray<TEvent>>;
}
