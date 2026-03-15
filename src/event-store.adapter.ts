import type * as z from "zod/v4";
import type { GenericEvent, GenericParsedEventSchema } from "./event.types";
import type { EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";

type FindEventsHandler = (
  stream: EventStreamType,
  names: ReadonlyArray<GenericEvent["name"]>,
) => Promise<ReadonlyArray<GenericEvent>>;

type InserterEventsHandler = (
  events: ReadonlyArray<z.infer<GenericParsedEventSchema>>,
) => Promise<ReadonlyArray<z.infer<GenericParsedEventSchema>>>;

type Config<TEvent extends GenericEvent> = {
  finder: FindEventsHandler;
  inserter: InserterEventsHandler;
  registry: EventValidatorRegistryPort<TEvent>;
};

const EventStoreAdapterError = { UniqueStream: "event.store.adapter.error.unique.stream" };

export class EventStoreAdapter<TEvent extends GenericEvent> implements EventStorePort<TEvent> {
  constructor(private readonly config: Config<TEvent>) {}

  static EMPTY_STREAM_REVISION = -1;

  async find(stream: EventStreamType): Promise<ReadonlyArray<TEvent>> {
    const rows = await this.config.finder(stream, this.config.registry.names);

    return rows
      .map((row) => ({ ...row, payload: JSON.parse(row.payload as string) }))
      .map((row) => this.config.registry.validate(row));
  }

  async save(events: ReadonlyArray<TEvent>): Promise<ReadonlyArray<TEvent>> {
    if (!events[0]) return [];

    const stream = events[0].stream;

    if (!events.every((event) => event.stream === stream)) {
      throw new Error(EventStoreAdapterError.UniqueStream);
    }

    const processed = await this.config.inserter(
      events.map((event) => ({ ...event, payload: JSON.stringify(event.payload) })),
    );

    return processed.map((event) => ({ ...event, payload: JSON.parse(event.payload) })) as Array<TEvent>;
  }
}
