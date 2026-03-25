import type { GenericEvent } from "./event.types";
import {
  type EventUpcaster,
  EventUpcasterRegistryError,
  type EventUpcasterRegistryPort,
} from "./event-upcaster-registry.port";

export class EventUpcasterRegistryAdapter implements EventUpcasterRegistryPort {
  private readonly map: Map<string, EventUpcaster<any, any>>;

  constructor(upcasters: ReadonlyArray<EventUpcaster<any, any>>) {
    this.map = new Map(upcasters.map((upcaster) => [`${upcaster.name}:${upcaster.fromVersion}`, upcaster]));
  }

  upcast(raw: GenericEvent): GenericEvent {
    let version = raw.version;
    let current: GenericEvent = raw;

    while (true) {
      const upcaster = this.map.get(`${current.name}:${version}`);

      if (!upcaster) break;
      if (upcaster.toVersion <= version) throw new Error(EventUpcasterRegistryError.VersionRegression);

      current = { ...upcaster.upcast(current), version: upcaster.toVersion };
      version = upcaster.toVersion;
    }

    return current;
  }
}
