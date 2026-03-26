import type { GenericEvent } from "./event.types";
import type { EventUpcasterPort } from "./event-upcaster.port";
import type { EventUpcasterStep } from "./event-upcaster-step.vo";

const EventUpcasterChainAdapterError = {
  DuplicateStep: "event.upcaster.chain.duplicate.step",
  GapInChain: "event.upcaster.chain.gap",
};

type EventUpcasterChainConfig = Record<GenericEvent["name"], ReadonlyArray<EventUpcasterStep<any, any>>>;

export class EventUpcasterChainAdapter implements EventUpcasterPort {
  private readonly upcasters: Record<GenericEvent["name"], ReadonlyArray<EventUpcasterStep<any, any>>>;

  constructor(config: EventUpcasterChainConfig) {
    this.upcasters = Object.fromEntries(
      Object.entries(config).map(([name, chain]) => [
        name,
        [...chain].sort((a, b) => a.config.fromVersion - b.config.fromVersion),
      ]),
    );

    for (const chain of Object.values(this.upcasters)) {
      const versions = chain.map((step) => step.config.fromVersion);

      if (new Set(versions).size !== versions.length) {
        throw new Error(EventUpcasterChainAdapterError.DuplicateStep);
      }

      if (chain.some((step, i) => i > 0 && step.config.fromVersion !== chain[i - 1]?.config.toVersion)) {
        throw new Error(EventUpcasterChainAdapterError.GapInChain);
      }
    }
  }

  upcast(event: GenericEvent): GenericEvent {
    const chain = this.upcasters[event.name];

    if (!chain) return event;

    return chain.reduce(
      (result, step) =>
        result.version === step.config.fromVersion
          ? { ...result, version: step.config.toVersion, payload: step.config.upcast(result.payload) }
          : result,
      event,
    );
  }
}
