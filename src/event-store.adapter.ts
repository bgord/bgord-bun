import type { GenericEvent } from "./event.types";
import type { EventFinderPort } from "./event-finder.port";
import type { EventInserterPort } from "./event-inserter.port";
import type { EventSerializerPort } from "./event-serializer.port";
import type { EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";

type Config = {
  finder: EventFinderPort;
  inserter: EventInserterPort;
  serializer: EventSerializerPort;
};

const EventStoreAdapterError = { UniqueStream: "event.store.adapter.error.unique.stream" };

export class EventStoreAdapter<Event extends GenericEvent> implements EventStorePort<Event> {
  constructor(private readonly config: Config) {}

  static EMPTY_STREAM_REVISION = -1;

  async find<FoundEvent extends Event>(
    registry: EventValidatorRegistryPort<FoundEvent>,
    stream: EventStreamType,
  ): Promise<ReadonlyArray<FoundEvent>> {
    const events = await this.config.finder.find(stream, registry.names);

    return events
      .map((event) => ({ ...event, payload: this.config.serializer.deserialize(event.payload) }))
      .map((event) => registry.validate(event));
  }

  async save(events: ReadonlyArray<Event>): Promise<ReadonlyArray<Event>> {
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
    })) as Array<Event>;
  }
}
