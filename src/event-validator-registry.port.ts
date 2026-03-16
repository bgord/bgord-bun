import type { GenericEvent } from "./event.types";

export const EventValidatorRegistryError = { NoAsyncSchema: "event.validator.registry.no.async.schema" };

export interface EventValidatorRegistryPort<Event> {
  readonly names: ReadonlyArray<GenericEvent["name"]>;

  accepts(name: GenericEvent["name"]): boolean;

  validate(raw: unknown): Event;
}
