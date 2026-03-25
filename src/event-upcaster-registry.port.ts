import type { GenericEvent } from "./event.types";

export type EventUpcaster<
  From extends GenericEvent = GenericEvent,
  To extends GenericEvent = GenericEvent,
> = {
  name: From["name"];
  fromVersion: From["version"];
  toVersion: To["version"];
  upcast(raw: From): To;
};

export const EventUpcasterRegistryError = { VersionRegression: "event.upcaster.registry.version.regression" };

export interface EventUpcasterRegistryPort {
  upcast(raw: GenericEvent): GenericEvent;
}
