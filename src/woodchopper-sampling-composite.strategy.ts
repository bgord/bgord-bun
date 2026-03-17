import type { LoggerEntry } from "./logger.port";
import type { WoodchopperSamplingStrategy } from "./woodchopper-sampling.strategy";

export class WoodchopperSamplingComposite implements WoodchopperSamplingStrategy {
  constructor(private readonly strategies: ReadonlyArray<WoodchopperSamplingStrategy>) {}

  decide(entry: LoggerEntry): boolean {
    for (const strategy of this.strategies) {
      if (strategy.decide(entry)) return true;
    }

    return false;
  }
}
