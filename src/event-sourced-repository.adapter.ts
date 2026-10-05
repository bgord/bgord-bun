import type { GenericEvent } from "./event.types";
import type { EventStorePort } from "./event-store.port";
import type { EventStreamType } from "./event-stream.vo";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";

type EventSourcedAggregate<Event extends GenericEvent> = { pullEvents(): ReadonlyArray<Event> };

type EventSourcedAggregateFactory<
  Id,
  Event extends GenericEvent,
  Aggregate extends EventSourcedAggregate<Event>,
  Deps,
> = {
  registry: EventValidatorRegistryPort<Event>;
  getStream: (id: Id) => EventStreamType;
  build: (id: Id, events: ReadonlyArray<Event>, deps: Deps) => Aggregate;
};

type Config<Id, Event extends GenericEvent, Aggregate extends EventSourcedAggregate<Event>, Deps> = {
  aggregate: EventSourcedAggregateFactory<Id, Event, Aggregate, Deps>;
};

type Dependencies<Event extends GenericEvent, Deps> = Deps & { EventStore: EventStorePort<Event> };

export class EventSourcedRepositoryAdapter<
  Id,
  Event extends GenericEvent,
  Aggregate extends EventSourcedAggregate<Event>,
  Deps,
> {
  constructor(
    private readonly config: Config<Id, Event, Aggregate, Deps>,
    private readonly deps: NoInfer<Dependencies<Event, Deps>>,
  ) {}

  async load(id: Id): Promise<Aggregate> {
    const history = await this.deps.EventStore.find(
      this.config.aggregate.registry,
      this.config.aggregate.getStream(id),
    );

    return this.config.aggregate.build(id, history, this.deps);
  }

  async save(aggregate: Aggregate): Promise<void> {
    await this.deps.EventStore.save(aggregate.pullEvents());
  }
}
