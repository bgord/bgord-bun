// Stryker disable all
import type * as z from "zod/v4";
import type { GenericEventSchema, GenericParsedEventSchema } from "./event.types";
import { EventStore as BaseStore } from "./event-store";
import type { EventStreamType } from "./event-stream.vo";
import type { EventBusPort } from "./message-bus.port";

export class DispatchingEventStore<AllEvents extends GenericEventSchema> extends BaseStore<AllEvents> {
  static EMPTY_STREAM_REVISION = -1;

  constructor(
    config: {
      finder: (
        stream: EventStreamType,
        names: ReadonlyArray<string>,
      ) => Promise<ReadonlyArray<z.infer<GenericEventSchema>>>;
      inserter: (
        events: ReadonlyArray<z.infer<GenericParsedEventSchema>>,
      ) => Promise<ReadonlyArray<z.infer<GenericParsedEventSchema>>>;
    },
    private readonly publisher: EventBusPort<z.infer<AllEvents>>,
  ) {
    super(config);
  }

  async save(_events: ReadonlyArray<z.infer<AllEvents>>): Promise<ReadonlyArray<z.infer<AllEvents>>> {
    const events = await super.save(_events);

    await Promise.all(events.map((event) => this.publisher.emit(event)));

    return events;
  }
}
// Stryker restore all
