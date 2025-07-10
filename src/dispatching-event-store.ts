import { z } from "zod";
import type { GenericEventSchema, GenericParsedEventSchema } from "./event.types";
import type { EventPublisher } from "./event-publisher.types";
import { EventStore as BaseStore } from "./event-store";
import type { EventStreamType } from "./event-stream.vo";
import { ToEventMap } from "./to-event-map.types";

export class DispatchingEventStore<AllEvents extends GenericEventSchema> extends BaseStore<AllEvents> {
  constructor(
    config: {
      finder: (stream: EventStreamType, names: string[]) => Promise<z.infer<GenericEventSchema>[]>;
      inserter: (events: z.infer<GenericParsedEventSchema>[]) => Promise<void>;
    },
    private readonly publisher: EventPublisher<ToEventMap<z.infer<AllEvents>>>,
  ) {
    super(config);
  }

  async save(events: z.infer<AllEvents>[]) {
    await super.save(events);

    await Promise.all(
      events.map((event) =>
        this.publisher.emit(event.name as keyof ToEventMap<z.infer<AllEvents>>, event as any),
      ),
    );
  }
}
