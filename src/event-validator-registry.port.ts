import type { GenericEvent } from "./event.types";

export interface EventValidatorRegistryPort<Event> {
  readonly names: ReadonlyArray<GenericEvent["name"]>;

  accepts(name: GenericEvent["name"]): boolean;

  validate(raw: unknown): Event;
}
