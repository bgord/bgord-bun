import type { GenericEvent } from "./event.types";

export type EventUpcasterStepConfig<
  From extends GenericEvent = GenericEvent,
  To extends GenericEvent = GenericEvent,
> = {
  name: GenericEvent["name"];
  fromVersion: GenericEvent["version"];
  toVersion: GenericEvent["version"];
  upcast: (payload: From["payload"]) => To["payload"];
};

const EventUpcasterStepError = { VersionIncrement: "event.upcaster.step.version.increment" };

export class EventUpcasterStep<
  From extends GenericEvent = GenericEvent,
  To extends GenericEvent = GenericEvent,
> {
  constructor(readonly config: EventUpcasterStepConfig<From, To>) {
    if (config.toVersion !== config.fromVersion + 1) throw new Error(EventUpcasterStepError.VersionIncrement);
  }
}
