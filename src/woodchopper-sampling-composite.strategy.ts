import type { LoggerEntry } from "./logger.port";
import type { WoodchoperSamplingStrategy } from "./woodchopper-sampling.strategy";

export class WoodchopperSamplingComposite implements WoodchoperSamplingStrategy {
  constructor(private readonly strategies: readonly WoodchoperSamplingStrategy[]) {}

  decide(entry: LoggerEntry): boolean {
    for (const strategy of this.strategies) {
      if (strategy.decide(entry)) return true;
    }

    return false;
  }
}
