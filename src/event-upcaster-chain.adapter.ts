import type { GenericEvent } from "./event.types";
import type { EventUpcasterPort } from "./event-upcaster.port";
import type { EventUpcasterStep } from "./event-upcaster-step.vo";

const EventUpcasterChainAdapterError = {
  DuplicateStep: "event.upcaster.chain.duplicate.step",
  GapInChain: "event.upcaster.chain.gap",
};

export class EventUpcasterChainAdapter implements EventUpcasterPort {
  private readonly chains: Map<GenericEvent["name"], ReadonlyArray<EventUpcasterStep>>;

  constructor(steps: ReadonlyArray<EventUpcasterStep>) {
    const grouped = new Map<GenericEvent["name"], Array<EventUpcasterStep>>();

    for (const step of steps) {
      const chain = grouped.get(step.config.name) ?? [];

      chain.push(step);
      grouped.set(step.config.name, chain);
    }

    for (const [name, chain] of grouped) {
      chain.sort((a, b) => a.config.fromVersion - b.config.fromVersion);

      for (let i = 0; i < chain.length; i++) {
        const current = chain[i] as EventUpcasterStep;

        if (chain.findIndex((s) => s.config.fromVersion === current.config.fromVersion) !== i) {
          throw new Error(EventUpcasterChainAdapterError.DuplicateStep);
        }

        if (i > 0) {
          const previous = chain[i - 1] as EventUpcasterStep;

          if (current.config.fromVersion !== previous.config.toVersion) {
            throw new Error(EventUpcasterChainAdapterError.GapInChain);
          }
        }
      }

      grouped.set(name, chain);
    }

    this.chains = grouped;
  }

  upcast(event: GenericEvent): GenericEvent {
    const chain = this.chains.get(event.name);

    if (!chain) return event;

    let result = { ...event };

    for (const step of chain) {
      if (result.version === step.config.fromVersion) {
        result = { ...result, version: step.config.toVersion, payload: step.config.upcast(result.payload) };
      }
    }

    return result;
  }
}
