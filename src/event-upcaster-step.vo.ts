import type { GenericEvent } from "./event.types";

export type EventUpcasterStepConfig<
  PayloadFrom extends GenericEvent["payload"] = GenericEvent["payload"],
  PayloadTo extends GenericEvent["payload"] = GenericEvent["payload"],
> = {
  name: GenericEvent["name"];
  fromVersion: GenericEvent["version"];
  toVersion: GenericEvent["version"];
  upcast: (payload: PayloadFrom) => PayloadTo;
};

const EventUpcasterStepError = { VersionIncrement: "event.upcaster.step.version.increment" };

export class EventUpcasterStep<
  TFrom extends GenericEvent["payload"] = GenericEvent["payload"],
  TTo extends GenericEvent["payload"] = GenericEvent["payload"],
> {
  constructor(readonly config: EventUpcasterStepConfig<TFrom, TTo>) {
    if (config.toVersion !== config.fromVersion + 1) throw new Error(EventUpcasterStepError.VersionIncrement);
  }
}
