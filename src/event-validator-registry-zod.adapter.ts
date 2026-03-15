import type { GenericEvent, GenericEventSchema } from "./event.types";
import type { EventValidatorRegistryPort } from "./event-validator-registry.port";

const EventValidatorRegistryZodAdapterError = {
  MissingName: "event.validator.registry.zod.adapter.error.missing.name",
  UnknownEvent: "event.validator.registry.zod.adapter.error.unknown.event",
};

export class EventValidatorRegistryZodAdapter<TEvent> implements EventValidatorRegistryPort<TEvent> {
  private readonly map: Map<GenericEvent["name"], GenericEventSchema>;
  readonly names: ReadonlyArray<GenericEvent["name"]>;

  constructor(schemas: ReadonlyArray<GenericEventSchema>) {
    this.map = new Map(schemas.map((schema) => [schema.shape.name.value, schema]));
    this.names = [...this.map.keys()];
  }

  accepts(name: GenericEvent["name"]): boolean {
    return this.map.has(name);
  }

  validate(raw: unknown): TEvent {
    const name = (raw as { name?: GenericEvent["name"] }).name;
    if (!name) throw new Error(EventValidatorRegistryZodAdapterError.MissingName);

    const schema = this.map.get(name);
    if (!schema) throw new Error(EventValidatorRegistryZodAdapterError.UnknownEvent);

    return schema.parse(raw) as TEvent;
  }
}
