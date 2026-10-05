import type { EventLogEntry, EventLogReadConfig, EventLogReaderPort } from "./event-log-reader.port";

export class EventLogReaderMemoryAdapter implements EventLogReaderPort {
  constructor(private readonly entries: ReadonlyArray<EventLogEntry>) {}

  async read(config: EventLogReadConfig): Promise<ReadonlyArray<EventLogEntry>> {
    return this.entries
      .filter((entry) => config.names.includes(entry.name))
      .filter((entry) => entry.position > config.after)
      .toSorted((a, b) => a.position - b.position)
      .slice(0, config.limit);
  }
}
