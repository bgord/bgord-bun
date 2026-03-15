import type { GenericEvent, GenericParsedEvent } from "./event.types";
import type { EventSerializerPort } from "./event-serializer.port";
import type { EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";

type FindEventsHandler = (
  stream: EventStreamType,
  names: ReadonlyArray<GenericEvent["name"]>,
) => Promise<ReadonlyArray<GenericParsedEvent>>;

type InserterEventsHandler = (
  events: ReadonlyArray<GenericParsedEvent>,
) => Promise<ReadonlyArray<GenericParsedEvent>>;

type Config<TEvent extends GenericEvent> = {
  finder: FindEventsHandler;
  inserter: InserterEventsHandler;
  registry: EventValidatorRegistryPort<TEvent>;
  serializer: EventSerializerPort;
};

const EventStoreAdapterError = { UniqueStream: "event.store.adapter.error.unique.stream" };

export class EventStoreAdapter<TEvent extends GenericEvent> implements EventStorePort<TEvent> {
  constructor(private readonly config: Config<TEvent>) {}

  static EMPTY_STREAM_REVISION = -1;

  async find(stream: EventStreamType): Promise<ReadonlyArray<TEvent>> {
    const events = await this.config.finder(stream, this.config.registry.names);

    return events
      .map((event) => ({ ...event, payload: this.config.serializer.deserialize(event.payload) }))
      .map((event) => this.config.registry.validate(event));
  }

  async save(events: ReadonlyArray<TEvent>): Promise<ReadonlyArray<TEvent>> {
    if (!events[0]) return [];

    const stream = events[0].stream;

    if (!events.every((event) => event.stream === stream)) {
      throw new Error(EventStoreAdapterError.UniqueStream);
    }

    const serialized = await this.config.inserter(
      events.map((event) => ({ ...event, payload: this.config.serializer.serialize(event.payload) })),
    );

    return serialized.map((event) => ({
      ...event,
      payload: this.config.serializer.deserialize(event.payload),
    })) as Array<TEvent>;
  }
}
