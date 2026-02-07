// Stryker disable all
import type * as z from "zod/v4";
import type { GenericEventSchema, GenericParsedEventSchema } from "./event.types";
import type { EventStreamType } from "./event-stream.vo";

export type EventNameType = z.infer<GenericEventSchema["shape"]["name"]>;

type FindEventsHandler = (
  stream: EventStreamType,
  acceptedEventsNames: ReadonlyArray<EventNameType>,
) => Promise<ReadonlyArray<z.infer<GenericEventSchema>>>;

type InserterEventsHandler = (
  events: ReadonlyArray<z.infer<GenericParsedEventSchema>>,
) => Promise<ReadonlyArray<z.infer<GenericParsedEventSchema>>>;

type EventStoreConfigType = { finder: FindEventsHandler; inserter: InserterEventsHandler };

export class EventStore<AllEvents extends GenericEventSchema> {
  constructor(private readonly config: EventStoreConfigType) {}

  static EMPTY_STREAM_REVISION = -1;

  async find<AcceptedEvents extends ReadonlyArray<AllEvents>>(
    acceptedEvents: AcceptedEvents,
    stream: EventStreamType,
  ): Promise<ReadonlyArray<z.infer<AcceptedEvents[number]>>> {
    const acceptedEventsNames = acceptedEvents.map((event) => event.shape.name.value);

    const rows = await this.config.finder(stream, acceptedEventsNames);

    return rows
      .map((row) => ({ ...row, payload: JSON.parse(row.payload) }))
      .map((row) => acceptedEvents.find((event) => event.shape.name.value === row.name)?.parse(row))
      .filter((event): event is z.infer<AcceptedEvents[number]> => event !== undefined);
  }

  async save(events: ReadonlyArray<z.infer<AllEvents>>): Promise<ReadonlyArray<z.infer<AllEvents>>> {
    if (!events[0]) return [];

    const stream = events[0].stream;

    if (!events.every((event) => event.stream === stream)) throw new EventStoreSaveUniqueStream();

    // The returned variable has the `revision` fields added by the inserter,
    // but we need to re-parse it to keep the contract.
    const processed = await this.config.inserter(
      events.map((event) => ({ ...event, payload: JSON.stringify(event.payload) })),
    );

    return processed.map((event) => ({
      ...event,
      payload: JSON.parse(event.payload),
    })) as Array<z.infer<AllEvents>>;
  }
}

export class EventStoreSaveUniqueStream extends Error {
  constructor() {
    super();
    Object.setPrototypeOf(this, EventStoreSaveUniqueStream.prototype);
  }
}
// Stryker restore all
