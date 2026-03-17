import type { LoggerEntry } from "./logger.port";
import type { WoodchopperSamplingStrategy } from "./woodchopper-sampling.strategy";

export class WoodchopperSamplingPassComponent implements WoodchopperSamplingStrategy {
  constructor(private readonly components: ReadonlyArray<LoggerEntry["component"]>) {}

  decide(entry: LoggerEntry): boolean {
    return this.components.includes(entry.component);
  }
}
