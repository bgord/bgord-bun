import type { GenericEvent, GenericEventSerialized } from "./event.types";

export type EventLogEntry = GenericEventSerialized & { position: number };

export type EventLogReadConfig = {
  names: ReadonlyArray<GenericEvent["name"]>;
  after: number;
  limit: number;
};

export interface EventLogReaderPort {
  read(config: EventLogReadConfig): Promise<ReadonlyArray<EventLogEntry>>;
}
