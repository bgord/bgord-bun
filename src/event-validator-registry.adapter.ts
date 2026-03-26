import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { GenericEvent } from "./event.types";
import {
  EventValidatorRegistryError,
  type EventValidatorRegistryPort,
} from "./event-validator-registry.port";

export type GenericEventSchemaRegistry<Event> = Readonly<
  Record<GenericEvent["name"], StandardSchemaV1<unknown, Event>>
>;

const EventValidatorRegistryAdapterError = {
  MissingName: "event.validator.registry.adapter.error.missing.name",
  UnknownEvent: "event.validator.registry.adapter.error.unknown.event",
};

export class EventValidatorRegistryAdapter<Event> implements EventValidatorRegistryPort<Event> {
  private readonly map: Map<GenericEvent["name"], StandardSchemaV1<unknown, Event>>;
  readonly names: ReadonlyArray<GenericEvent["name"]>;

  constructor(registry: GenericEventSchemaRegistry<Event>) {
    this.map = new Map(Object.entries(registry));
    this.names = Object.keys(registry);
  }

  accepts(name: GenericEvent["name"]): boolean {
    return this.map.has(name);
  }

  validate(raw: unknown): Event {
    const name = (raw as { name?: GenericEvent["name"] }).name;
    if (!name) throw new Error(EventValidatorRegistryAdapterError.MissingName);

    const schema = this.map.get(name);
    if (!schema) throw new Error(EventValidatorRegistryAdapterError.UnknownEvent);

    const result = schema["~standard"].validate(raw);

    if (result instanceof Promise) throw new Error(EventValidatorRegistryError.NoAsyncSchema);
    if (result.issues) throw new Error(result.issues[0]?.message);
    return result.value;
  }
}
