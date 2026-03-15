import type { GenericEvent } from "./event.types";
import type { EventFinderPort } from "./event-finder.port";
import type { EventInserterPort } from "./event-inserter.port";
import type { EventSerializerPort } from "./event-serializer.port";
import type { EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";

type Config<TEvent extends GenericEvent> = {
  finder: EventFinderPort;
  inserter: EventInserterPort;
  registry: EventValidatorRegistryPort<TEvent>;
  serializer: EventSerializerPort;
};

const EventStoreAdapterError = { UniqueStream: "event.store.adapter.error.unique.stream" };

export class EventStoreAdapter<TEvent extends GenericEvent> implements EventStorePort<TEvent> {
  constructor(private readonly config: Config<TEvent>) {}

  static EMPTY_STREAM_REVISION = -1;

  async find(stream: EventStreamType): Promise<ReadonlyArray<TEvent>> {
    const events = await this.config.finder.find(stream, this.config.registry.names);

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

    const serialized = await this.config.inserter.insert(
      events.map((event) => ({ ...event, payload: this.config.serializer.serialize(event.payload) })),
    );

    return serialized.map((event) => ({
      ...event,
      payload: this.config.serializer.deserialize(event.payload),
    })) as Array<TEvent>;
  }
}
