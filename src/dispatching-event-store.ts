// Stryker disable all
import type * as z from "zod/v4";
import type { GenericEventSchema, GenericParsedEventSchema } from "./event.types";
import type { EventPublisher } from "./event-publisher.types";
import { EventStore as BaseStore } from "./event-store";
import type { EventStreamType } from "./event-stream.vo";
import type { ToEventMap } from "./to-event-map.types";

export class DispatchingEventStore<AllEvents extends GenericEventSchema> extends BaseStore<AllEvents> {
  static EMPTY_STREAM_REVISION = -1;

  constructor(
    config: {
      finder: (
        stream: EventStreamType,
        names: ReadonlyArray<string>,
      ) => Promise<z.infer<GenericEventSchema>[]>;
      inserter: (events: z.infer<GenericParsedEventSchema>[]) => Promise<z.infer<GenericParsedEventSchema>[]>;
    },
    private readonly publisher: EventPublisher<ToEventMap<z.infer<AllEvents>>>,
  ) {
    super(config);
  }

  async save(_events: z.infer<AllEvents>[]): Promise<z.infer<AllEvents>[]> {
    // We receive the events with the `revision` fields added by the inserter,
    // so the read models can receive them.
    const events = await super.save(_events);

    await Promise.all(
      events.map((event) =>
        this.publisher.emit(event.name as keyof ToEventMap<z.infer<AllEvents>>, event as any),
      ),
    );

    return events;
  }
}
// Stryker restore all
