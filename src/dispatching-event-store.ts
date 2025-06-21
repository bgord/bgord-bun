// packages/bun/src/dispatching-event-store.ts
import { z } from "zod/v4";
import type { GenericEventSchema, GenericParsedEventSchema } from "./event.types";
import type { EventPublisher } from "./event-publisher.types";
import { EventStore as BaseStore } from "./event-store";
import type { EventStreamType } from "./event-stream.vo";

export class DispatchingEventStore<
  AllEvents extends GenericEventSchema,
  EventMap extends Record<string, any>,
> extends BaseStore<AllEvents> {
  constructor(
    config: {
      finder: (stream: EventStreamType, names: string[]) => Promise<z.infer<GenericEventSchema>[]>;
      inserter: (events: z.infer<GenericParsedEventSchema>[]) => Promise<void>;
    },
    private readonly publisher: EventPublisher<EventMap>,
  ) {
    super(config);
  }

  async save(events: z.infer<AllEvents>[]) {
    await super.save(events);

    await Promise.all(events.map((event) => this.publisher.emit(event.name as keyof EventMap, event as any)));
  }
}
