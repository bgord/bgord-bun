import type { LoggerEntry } from "./logger.port";
import type { WoodchoperSamplingStrategy } from "./woodchopper-sampling.strategy";

export class WoodchopperSamplingPassComponent implements WoodchoperSamplingStrategy {
  constructor(private readonly components: LoggerEntry["component"][]) {}

  decide(entry: LoggerEntry): boolean {
    return this.components.includes(entry.component);
  }
}
