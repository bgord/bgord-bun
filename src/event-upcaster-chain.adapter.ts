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
    this.upcasters = {};

    for (const [name, chain] of Object.entries(config)) {
      const steps = [...chain].sort((a, b) => a.config.fromVersion - b.config.fromVersion);

      this.upcasters[name] = steps;

      const seen = new Set<number>();

      for (let i = 0; i < steps.length; i++) {
        const current = steps[i] as EventUpcasterStep;

        if (seen.has(current.config.fromVersion)) {
          throw new Error(EventUpcasterChainAdapterError.DuplicateStep);
        }
        seen.add(current.config.fromVersion);

        if (i > 0) {
          const previous = steps[i - 1] as EventUpcasterStep;

          if (current.config.fromVersion !== previous.config.toVersion) {
            throw new Error(EventUpcasterChainAdapterError.GapInChain);
          }
        }
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
