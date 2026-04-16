import type { GenericEvent } from "./event.types";
import type { EventFinderPort } from "./event-finder.port";
import type { EventFinderLastPort } from "./event-finder-last.port";
import type { EventInserterPort } from "./event-inserter.port";
import type { EventFinderConfig, EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventUpcasterPort } from "./event-upcaster.port";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";
import type { PayloadSerializerPort } from "./payload-serializer.port";

type Config = {
  finder: EventFinderPort;
  finderLast: EventFinderLastPort;
  inserter: EventInserterPort;
  serializer: PayloadSerializerPort;
  upcaster?: EventUpcasterPort;
};

const EventStoreAdapterError = { UniqueStream: "event.store.adapter.error.unique.stream" };

export class EventStoreAdapter<Event extends GenericEvent> implements EventStorePort<Event> {
  constructor(private readonly config: Config) {}

  async find<FoundEvent extends Event>(
    registry: EventValidatorRegistryPort<FoundEvent>,
    stream: EventStreamType,
    config?: EventFinderConfig,
  ): Promise<ReadonlyArray<FoundEvent>> {
    const events = await this.config.finder.find(stream, registry.names, config);

    return events
      .map((event) => ({ ...event, payload: this.config.serializer.deserialize(event.payload) }))
      .map((event) => (this.config.upcaster ? this.config.upcaster.upcast(event) : event))
      .map((event) => registry.validate(event));
  }

  async findLast<FoundEvent extends Event>(
    registry: EventValidatorRegistryPort<FoundEvent>,
    stream: EventStreamType,
  ): Promise<FoundEvent | null> {
    const event = await this.config.finderLast.findLast(stream, registry.names);
    if (!event) return null;

    const deserialized = { ...event, payload: this.config.serializer.deserialize(event.payload) };
    const upcasted = this.config.upcaster ? this.config.upcaster.upcast(deserialized) : deserialized;

    return registry.validate(upcasted);
  }

  async save<SavedEvent extends Event>(
    events: ReadonlyArray<SavedEvent>,
  ): Promise<ReadonlyArray<SavedEvent>> {
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
    })) as Array<SavedEvent>;
  }
}
